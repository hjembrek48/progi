from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Note,
    Profile,
    Genre,
    Game,
    Listing,
    WishlistEntry,
    SwapOffer,
    Notification,
)


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class ProfileSerializer(serializers.ModelSerializer):
    interests = GenreSerializer(many=True, read_only=True)
    interest_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(),
        source="interests",
        write_only=True,
        many=True,
        required=False,
    )

    class Meta:
        model = Profile
        fields = [
            "id",
            "address",
            "latitude",
            "longitude",
            "updated_at",
            "interests",
            "interest_ids",
        ]
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


class GameSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    borrower_profile = ProfileSerializer(read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(),
        source="genre",
        write_only=True,
        required=False,
        allow_null=True,
    )
    genre = GenreSerializer(read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "description",
            "photo",
            "publisher",
            "grade",
            "number_of_players",
            "playing_time",
            "complexity",
            "active",
            "profile",
            "borrower_profile",
            "genre",
            "genre_id",
            "created_at",
        ]
        read_only_fields = ["profile", "borrower_profile", "created_at"]


class ListingSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), source="game", write_only=True
    )

    class Meta:
        model = Listing
        fields = ["id", "description", "profile", "game", "game_id", "created_at"]
        read_only_fields = ["profile", "created_at"]

    def validate_game_id(self, value):
        request = self.context.get("request")
        if request and value.profile != request.user.profile:
            raise serializers.ValidationError(
                "You can only list games that belong to you."
            )
        return value


class WishlistSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), source="game", write_only=True
    )

    class Meta:
        model = WishlistEntry
        fields = ["id", "game", "game_id", "created_at"]
        read_only_fields = ["created_at"]

    def validate_game_id(self, value):
        request = self.context.get("request")
        if request and value.profile == request.user.profile:
            raise serializers.ValidationError(
                "You cannot add your own game to the wishlist."
            )
        return value


class SwapOfferSerializer(serializers.ModelSerializer):
    proposer = ProfileSerializer(read_only=True)
    target = ProfileSerializer(read_only=True)
    offered_games = GameSerializer(many=True, read_only=True)
    requested_games = GameSerializer(many=True, read_only=True)

    offered_game_ids = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), source="offered_games", write_only=True, many=True
    )
    requested_game_ids = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(),
        source="requested_games",
        write_only=True,
        many=True,
    )
    target_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), source="target", write_only=True, required=False
    )

    class Meta:
        model = SwapOffer
        fields = [
            "id",
            "proposer",
            "target",
            "target_id",
            "status",
            "offered_games",
            "requested_games",
            "offered_game_ids",
            "requested_game_ids",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["proposer", "status", "created_at", "updated_at"]

    def validate(self, data):
        request = self.context.get("request")
        if not request:
            return data

        if self.instance:
            proposer = self.instance.proposer
            target = self.instance.target
        else:
            proposer = request.user.profile
            target = data.get("target")
            if not target:
                raise serializers.ValidationError(
                    "Target user is required for new swap offers."
                )
            if proposer == target:
                raise serializers.ValidationError("You cannot swap with yourself.")

        offered_games = data.get("offered_games", [])
        for game in offered_games:
            if game.profile != proposer:
                raise serializers.ValidationError(
                    f"Game '{game.name}' does not belong to the proposer ({proposer.user.username})."
                )
            if not game.active:
                raise serializers.ValidationError(f"Game '{game.name}' is not active.")

        requested_games = data.get("requested_games", [])
        for game in requested_games:
            if game.profile != target:
                raise serializers.ValidationError(
                    f"Game '{game.name}' does not belong to the target ({target.user.username})."
                )
            if not game.active:
                raise serializers.ValidationError(f"Game '{game.name}' is not active.")

        return data


class NotificationSerializer(serializers.ModelSerializer):
    swap_offer = SwapOfferSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recieved_profile",
            "profile",
            "description",
            "read",
            "time",
            "swap_offer",
        ]
        read_only_fields = ["recieved_profile", "profile", "time", "swap_offer"]
