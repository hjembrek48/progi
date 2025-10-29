from django.urls import path
from .views import NoteListCreate, NoteDelete, CreateUserView

urlpatterns = [
    path("notes/", NoteListCreate.as_view(), name="notes-list-create"),
    path("notes/<int:pk>/", NoteDelete.as_view(), name="notes-delete"),
    path("user/register/", CreateUserView.as_view(), name="user-register"),
]
