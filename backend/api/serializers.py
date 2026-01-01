from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Profile, Genre, Game, Listing, WishlistEntry

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "address", "latitude", "longitude", "updated_at"]
        read_only_fields = ["updated_at"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]

class GameSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    borrower_profile = ProfileSerializer(read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), source='genre', write_only=True, required=False, allow_null=True
    )
    genre = GenreSerializer(read_only=True)

    class Meta:
        model = Game
        fields = [
            "id", "name", "description", "photo", "publisher", 
            "grade", "number_of_players", "playing_time", "complexity", 
            "active", "profile", "borrower_profile", "genre", "genre_id", "created_at"
        ]
        read_only_fields = ["profile", "borrower_profile", "created_at"]

class ListingSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), source='game', write_only=True
    )

    class Meta:
        model = Listing
        fields = ["id", "description", "profile", "game", "game_id", "created_at"]
        read_only_fields = ["profile", "created_at"]

    def validate_game_id(self, value):
        request = self.context.get('request')
        if request and value.profile != request.user.profile:
            raise serializers.ValidationError("You can only list games that belong to you.")
        return value

class WishlistSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), source='game', write_only=True
    )

    class Meta:
        model = WishlistEntry
        fields = ["id", "game", "game_id", "created_at"]
        read_only_fields = ["created_at"]

    def validate_game_id(self, value):
        request = self.context.get('request')
        if request and value.profile == request.user.profile:
            raise serializers.ValidationError("You cannot add your own game to the wishlist.")
        return value