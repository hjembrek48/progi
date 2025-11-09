# api/views.py

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
import requests
import secrets
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import Note
from .serializers import NoteSerializer, UserSerializer, ProfileSerializer
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation

def round6(value):
    try:
        return str(Decimal(str(value)).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))
    except InvalidOperation:
        return None

def create_cookie_response(user: User) -> Response:

    refresh = RefreshToken.for_user(user)

    res = Response(
        {
            "access": str(refresh.access_token),
            "username": user.username,
        },
        status=status.HTTP_200_OK,
    )
    res.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=settings.USE_SECURE_COOKIES,
        samesite="None" if settings.USE_SECURE_COOKIES else "Lax",
        max_age=14 * 24 * 3600,
    )

    return res

def geocode_address(address: str):
    """
    Vrati (lat, lon) za zadanu adresu ili None ako nije nađeno.
    Koristi OSM Nominatim. Poštuj rate-limit (<=1 req/s).
    """
    if not address or not address.strip():
        return None

    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": "progi-app/1.0 (contact: your-email@example.com)"},
            timeout=5,
        )
        if r.status_code != 200:
            return None
        data = r.json()
        if not data:
            return None

        return (data[0].get("lat"), data[0].get("lon"))
    except requests.RequestException:
        return None

class LogInWithGoogle(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("USING COOKIE LOGIN >>>", settings.USE_SECURE_COOKIES)
        token = request.data.get("google_access_token")
        if not token:
            return Response({"detail": "Missing 'google_access_token'."}, status=400)

        # Dohvati google userinfo
        try:
            r = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,
            )
            print("GOOGLE STATUS =>", r.status_code)
            if r.status_code != 200:
                print("GOOGLE BODY   =>", r.text[:300])
        except requests.RequestException:
            return Response({"detail": "Failed to contact Google."}, status=502)

        if r.status_code != 200:
            return Response({"detail": "Invalid Google token."}, status=401)

        data = r.json()
        email = data.get("email")
        first_name = data.get("given_name", "") or ""
        last_name = data.get("family_name", "") or ""

        first_name = str(first_name) if first_name else ""
        last_name = str(last_name) if last_name else ""
        avatar = data.get("picture", "") or ""

        if not email:
            return Response({"detail": "Google profile has no email."}, status=400)

        # Nađi ili kreiraj usera
        user = User.objects.filter(Q(email=email) | Q(username=email)).first()
        if user is None:
            base_username = email.split("@")[0]
            username = base_username
            i = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{i}"
                i += 1
            print(">>> EMAIL =", email)
            print(">>> FIRST =", repr(first_name))
            print(">>> LAST =", repr(last_name))
            print(">>> USERNAME =", username)
            user = User.objects.create_user(
                username=username,
                email=email,
                password = secrets.token_urlsafe(32),
                first_name=first_name[:150],
                last_name=last_name[:150],
            )

        # Vrati access + postavi refresh u cookie
        return create_cookie_response(user)


class RefreshFromCookie(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.COOKIES.get("refresh_token")
        if not token:
            return Response({"detail": "No refresh cookie"}, status=401)
        try:
            refresh = RefreshToken(token)
            return Response({"access": str(refresh.access_token)}, status=200)
        except TokenError:
            return Response({"detail": "Invalid refresh"}, status=401)


class Logout(APIView):
    def post(self, request):
        res = Response({"detail": "Logged out"}, status=200)
        res.delete_cookie("refresh_token", path="/")
        return res


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

class ProfileLocationUpdate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        return Response(ProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = request.user.profile
        payload = request.data.copy()

        # Ako dobijemo adresu, a nema lat/lon -> popuni iz geocodinga
        addr = payload.get("address")
        if addr and (not payload.get("latitude") or not payload.get("longitude")):
            coords = geocode_address(addr)
            if coords:
                lat, lon = coords
                payload["latitude"]  = round6(lat)
                payload["longitude"] = round6(lon)


        ser = ProfileSerializer(profile, data=payload, partial=False)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        profile = request.user.profile
        payload = request.data.copy()

        addr = payload.get("address")
        if addr and (not payload.get("latitude") or not payload.get("longitude")):
            coords = geocode_address(addr)
            if coords:
                lat, lon = coords
                payload["latitude"]  = round6(lat)
                payload["longitude"] = round6(lon)


        ser = ProfileSerializer(profile, data=payload, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]