#api-urls.py
from django.urls import path
from .views import (
    NoteListCreate, NoteDelete, CreateUserView,
    LogInWithGoogle, RefreshFromCookie, Logout, ProfileLocationUpdate,
)

urlpatterns = [
    path("google-login/", LogInWithGoogle.as_view(), name="google-login"),
    path("token/refresh-cookie/", RefreshFromCookie.as_view(), name="refresh-cookie"),
    path("logout/", Logout.as_view(), name="logout"),
    path("profile/location/", ProfileLocationUpdate.as_view(), name="profile-location"),
    path("notes/", NoteListCreate.as_view(), name="notes"),
    path("notes/<int:pk>/", NoteDelete.as_view(), name="note-delete"),
    path("users/", CreateUserView.as_view(), name="users-create"),
]