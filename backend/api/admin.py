from django.contrib import admin
from .models import (
    Genre, Game, Profile, BoardGame, Listing,
    WishlistEntry, SwapOffer, Report, Notification, Note, HasInterest
)

admin.site.register(Genre)
admin.site.register(Game)
admin.site.register(BoardGame)
admin.site.register(Listing)
admin.site.register(WishlistEntry)
admin.site.register(SwapOffer)
admin.site.register(Report)
admin.site.register(Notification)
admin.site.register(Note)

class HasInterestInline(admin.TabularInline):
    model = HasInterest
    extra = 1


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    inlines = [HasInterestInline]
