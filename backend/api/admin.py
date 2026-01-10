from django.contrib import admin
from .models import (
    Genre, Game, Profile, BoardGame, Listing, 
    WishlistEntry, SwapOffer, Notification, Note
)

admin.site.register(Genre)
admin.site.register(Game)
admin.site.register(Profile)
admin.site.register(BoardGame)
admin.site.register(Listing)
admin.site.register(WishlistEntry)
admin.site.register(SwapOffer)
admin.site.register(Notification)
admin.site.register(Note)