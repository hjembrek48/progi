from rest_framework import permissions

class IsModerator(permissions.BasePermission):
    """
    Allows access only to users who are staff (moderators) or superusers.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))
