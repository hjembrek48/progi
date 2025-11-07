# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from backend.views import ProfileRetrieveUpdate   # ako ti treba

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', admin.site.urls),

    path('api/', include('api.urls')),

    path('api-auth/', include('rest_framework.urls')),

    path('api/profile/', ProfileRetrieveUpdate.as_view(), name='profile'),
]
