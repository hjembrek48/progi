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
    Report,
    Notification,
    BoardGame,
    PushSubscription,
)

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class BoardGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardGame
        fields = ["id", "bgg_id", "name", "image_url", "year_published"]


class BoardGameDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardGame
        fields = "__all__"


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
            "email"
        ]
        read_only_fields = ["updated_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
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
    board_game_id = serializers.PrimaryKeyRelatedField(
        queryset=BoardGame.objects.all(),
        source="board_game",
        write_only=True,
        required=False,
        allow_null=True,
    )
    board_game = BoardGameSerializer(read_only=True)

    name = serializers.CharField(source="board_game.name", read_only=True)
    min_players = serializers.IntegerField(source="board_game.min_players", read_only=True)
    max_players = serializers.IntegerField(source="board_game.max_players", read_only=True)
    playing_time = serializers.IntegerField(source="board_game.playing_time", read_only=True)
    complexity = serializers.FloatField(source="board_game.complexity", read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "description",
            "photo",
            "publisher",
            "grade",
            "min_players",
            "max_players",
            "playing_time",
            "complexity",
            "active",
            "profile",
            "borrower_profile",
            "genre",
            "genre_id",
            "board_game",
            "board_game_id",
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
        if Listing.objects.filter(game=value).exists():
            raise serializers.ValidationError({
                "This games already has listing"
            })
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
            game_name = game.board_game.name if game.board_game else f"Game #{game.id}"
            if game.profile != proposer:
                raise serializers.ValidationError(
                    f"Game '{game_name}' does not belong to the proposer ({proposer.user.username})."
                )
            if not game.active:
                raise serializers.ValidationError(f"Game '{game_name}' is not active.")

        requested_games = data.get("requested_games", [])
        for game in requested_games:
            game_name = game.board_game.name if game.board_game else f"Game #{game.id}"
            if game.profile != target:
                raise serializers.ValidationError(
                    f"Game '{game_name}' does not belong to the target ({target.user.username})."
                )
            if not game.active:
                raise serializers.ValidationError(f"Game '{game_name}' is not active.")

        return data

class ReportSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.user.username')
    class Meta:
        model = Report
        fields = [
            "id", 
            "sender", 
            "sender_username", 
            "target_listing", 
            "description", 
            "created_at"
        ]
        read_only_fields = ["sender", "sender_username", "created_at"]

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


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ["endpoint", "p256dh", "auth"]
