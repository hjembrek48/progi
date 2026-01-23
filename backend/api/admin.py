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
    list_display = ("user", "email", "avatar_preview", "updated_at")
    fields = (
        "user",
        "email",
        "description",
        "avatar",
        "address",
        "latitude",
        "longitude",
        "updated_at",
    )

    readonly_fields = ("updated_at",)

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:40px; height:40px; object-fit:cover; border-radius:50%;" />',
                obj.avatar.url
            )
        return "-"
    avatar_preview.short_description = "Avatar"
