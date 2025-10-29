# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic.base import RedirectView

from backend.views import LogInWithGoogle, ProfileRetrieveUpdate

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path("admin/", admin.site.urls),
    path("api/google-login/", LogInWithGoogle.as_view(), name="login-with-google"),
    path("api/profile/", ProfileRetrieveUpdate.as_view(), name="profile"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
]
