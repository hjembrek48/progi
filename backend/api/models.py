# api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.username})"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "profile"):
        Profile.objects.create(user=instance)

class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Game(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='game_photos/', blank=True, null=True)
    publisher = models.CharField(max_length=200, blank=True)
    grade = models.IntegerField(null=True, blank=True)
    number_of_players = models.IntegerField(null=True, blank=True)
    playing_time = models.IntegerField(null=True, blank=True)
    complexity = models.IntegerField(null=True, blank=True) 
    active = models.BooleanField(default=True)
    
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='games')
    borrower_profile = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='borrowed_games')
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True, related_name='games')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Listing(models.Model):
    description = models.TextField(blank=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='listings')
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name='listing')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Listing: {self.game.name} by {self.profile.user.username}"

class WishlistEntry(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='wishlist')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'game')

    def __str__(self):
        return f"{self.profile.user.username} wants {self.game.name}"

class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title
