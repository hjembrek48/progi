# backend/views.py
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import traceback
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Profile
from api.serializers import ProfileSerializer

def create_cookie_response(user):
    refresh = RefreshToken.for_user(user)
    res = Response(
        {
            "access": str(refresh.access_token),
            "username": user.username,
        },
        status=status.HTTP_200_OK,
    )

    samesite = "None" if getattr(settings, "USE_SECURE_COOKIES", False) else "Lax"

    res.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=getattr(settings, "USE_SECURE_COOKIES", False),
        samesite=samesite,
        path="/",
        max_age=14 * 24 * 3600,  # 14 dana
    )
    return res

@method_decorator(csrf_exempt, name='dispatch')
class LogInWithGoogle(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            print("USING COOKIE LOGIN >>>", getattr(settings, "USE_SECURE_COOKIES", False))

            token = request.data.get("google_access_token")
            if not token:
                return Response({"detail": "Missing 'google_access_token'."}, status=400)

            r = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10,
            )
            print("GOOGLE STATUS =>", r.status_code)
            if r.status_code != 200:
                print("GOOGLE BODY   =>", r.text[:300])
                return Response({"detail": "Google login failed."}, status=400)

            info = r.json()
            email = info.get("email")
            if not email:
                return Response({"detail": "Google response has no email."}, status=400)

            User = get_user_model()  
            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    "first_name": info.get("given_name", "") or "",
                    "last_name": info.get("family_name", "") or "",
                    "email":      email,
                    "is_active":  True,
                },
            )
            if created:
                user.set_password(get_random_string(32))
                user.save()

            profile, _ = Profile.objects.get_or_create(user=user)
            if profile.email != email:
                profile.email = email
                profile.save()
            return create_cookie_response(user)  

        except Exception as e:
            print("Internal Server Error: /api/google-login/")
            traceback.print_exc()
            return Response(
                {"detail": f"server error: {e.__class__.__name__}: {e}"},
                status=500,
            )

class ProfileRetrieveUpdate(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
