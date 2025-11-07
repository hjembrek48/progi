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
from .serializers import NoteSerializer, UserSerializer


def create_cookie_response(user: User) -> Response:
    """
    Vraća Response s access tokenom i username-om,
    te postavlja HttpOnly refresh cookie (JWT refresh).
    """
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
            # Ako imaš profil model za avatar, tu bi ga spremio;
            # u User ga standardno ne spremamo jer nema polje.

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


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]