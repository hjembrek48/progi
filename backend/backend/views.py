from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from api.models import Profile
from api.serializers import ProfileSerializer

import requests


class LogInWithGoogle(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            token = request.data["google_access_token"]

            r = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                params={"access_token": token},
                timeout=5,
            )
            # Ako Google vrati 4xx/5xx -> podigni exception
            r.raise_for_status()
            data = r.json()

            email = data.get("email")
            if not email:
                return Response(
                    {"detail": "Google response does not contain email."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            first_name = data.get("given_name", "")
            last_name = data.get("family_name", "")
            avatar = data.get("picture", "")

            user = User.objects.filter(email=email).first()
            if user is None:
                base_username = email.split("@")[0]
                username = base_username
                n = 1
                while User.objects.filter(username=username).exists():
                    n += 1
                    username = f"{base_username}{n}"

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )
                # social login -> onemogući lokalnu lozinku
                user.set_unusable_password()
                user.save()

            # Osiguraj da postoji Profile zapis
            profile, _ = Profile.objects.get_or_create(user=user)
            if avatar and not profile.avatar:
                profile.avatar = avatar
                profile.save()

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "username": user.username,
                },
                status=status.HTTP_200_OK,
            )

        except requests.RequestException:
            return Response(
                {"detail": "Failed to contact Google."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except KeyError:
            return Response(
                {"detail": "Missing 'google_access_token'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            # u produkciji: proper logging
            return Response(
                {"detail": "Google login failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileRetrieveUpdate(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        # profil trenutno prijavljenog korisnika
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
