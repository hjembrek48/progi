# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from backend.views import ProfileRetrieveUpdate
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', admin.site.urls),

    path('api/', include('api.urls')),

    path('api-auth/', include('rest_framework.urls')),

    path('api/profile/', ProfileRetrieveUpdate.as_view(), name='profile'),

    # Automatska dokumentacija API-ja
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
