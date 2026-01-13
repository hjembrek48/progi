# api/views.py

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
import secrets
from rest_framework import generics, status
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.exceptions import ValidationError
from .models import Note, Genre, Game, Listing, WishlistEntry, SwapOffer, Notification, BoardGame, PushSubscription
from .serializers import (
    NoteSerializer,
    UserSerializer,
    ProfileSerializer,
    GenreSerializer,
    GameSerializer,
    ListingSerializer,
    WishlistSerializer,
    SwapOfferSerializer,
    NotificationSerializer,
    BoardGameSerializer,
    BoardGameDetailSerializer,
    PushSubscriptionSerializer,
)
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from drf_spectacular.utils import extend_schema, OpenApiParameter


def round6(value):
    try:
        return str(
            Decimal(str(value)).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
        )
    except InvalidOperation:
        return None


def create_cookie_response(user: User) -> Response:

    refresh = RefreshToken.for_user(user)

    res = Response(
        {
            "access": str(refresh.access_token),
            "username": user.username,
        },
        status=status.HTTP_200_OK,
    )
    res.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=settings.USE_SECURE_COOKIES,
        samesite="None" if settings.USE_SECURE_COOKIES else "Lax",
        max_age=14 * 24 * 3600,
        path="/",
    )

    return res


def geocode_address(address: str):
    """
    Vrati (lat, lon) za zadanu adresu ili None ako nije nađeno.
    Koristi OSM Nominatim. Poštuj rate-limit (<=1 req/s).
    """
    if not address or not address.strip():
        return None

    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": "progi-app/1.0 (contact: your-email@example.com)"},
            timeout=5,
        )
        if r.status_code != 200:
            return None
        data = r.json()
        if not data:
            return None

        return (data[0].get("lat"), data[0].get("lon"))
    except requests.RequestException:
        return None


class LogInWithGoogle(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        print("USING COOKIE LOGIN >>>", settings.USE_SECURE_COOKIES)
        token = request.data.get("google_access_token")
        if not token:
            return Response({"detail": "Missing 'google_access_token'."}, status=400)

        # Dohvati google userinfo
        try:
            r = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,
            )
            print("GOOGLE STATUS =>", r.status_code)
            if r.status_code != 200:
                print("GOOGLE BODY   =>", r.text[:300])
        except requests.RequestException:
            return Response({"detail": "Failed to contact Google."}, status=502)

        if r.status_code != 200:
            return Response({"detail": "Invalid Google token."}, status=401)

        data = r.json()
        email = data.get("email")
        first_name = data.get("given_name", "") or ""
        last_name = data.get("family_name", "") or ""

        first_name = str(first_name) if first_name else ""
        last_name = str(last_name) if last_name else ""
        avatar = data.get("picture", "") or ""

        if not email:
            return Response({"detail": "Google profile has no email."}, status=400)

        # Nađi ili kreiraj usera
        user = User.objects.filter(Q(email=email) | Q(username=email)).first()
        if user is None:
            base_username = email.split("@")[0]
            username = base_username
            i = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{i}"
                i += 1
            print(">>> EMAIL =", email)
            print(">>> FIRST =", repr(first_name))
            print(">>> LAST =", repr(last_name))
            print(">>> USERNAME =", username)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=secrets.token_urlsafe(32),
                first_name=first_name[:150],
                last_name=last_name[:150],
            )
        
        from .models import Profile
        profile, _ = Profile.objects.get_or_create(user = user)
        if profile.email != email:
            profile.email = email
            profile.save()

        # Vrati access + postavi refresh u cookie
        return create_cookie_response(user)

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfCookieView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})

class RefreshFromCookie(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.COOKIES.get("refresh_token")
        if not token:
            return Response({"detail": "No refresh cookie"}, status=401)
        try:
            refresh = RefreshToken(token)
            return Response({"access": str(refresh.access_token)}, status=200)
        except TokenError:
            return Response({"detail": "Invalid refresh"}, status=401)


class Logout(APIView):
    def post(self, request):
        res = Response({"detail": "Logged out"}, status=200)
        res.set_cookie(
            "refresh_token",
            value="",
            path="/",
            samesite="None" if settings.USE_SECURE_COOKIES else "Lax",
            secure=settings.USE_SECURE_COOKIES,
            httponly=True,
            max_age=0,
            expires="Thu, 01 Jan 1970 00:00:00 GMT",
        )
        return res


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)


class ProfileLocationUpdate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        return Response(ProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = request.user.profile
        payload = request.data.copy()

        # Ako dobijemo adresu, a nema lat/lon -> popuni iz geocodinga
        addr = payload.get("address")
        if addr and (not payload.get("latitude") or not payload.get("longitude")):
            coords = geocode_address(addr)
            if coords:
                lat, lon = coords
                payload["latitude"] = round6(lat)
                payload["longitude"] = round6(lon)

        ser = ProfileSerializer(profile, data=payload, partial=False)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        profile = request.user.profile
        payload = request.data.copy()

        addr = payload.get("address")
        if addr and (not payload.get("latitude") or not payload.get("longitude")):
            coords = geocode_address(addr)
            if coords:
                lat, lon = coords
                payload["latitude"] = round6(lat)
                payload["longitude"] = round6(lon)

        ser = ProfileSerializer(profile, data=payload, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class GenreList(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [AllowAny]


class GameListCreate(generics.ListCreateAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Game.objects.filter(profile=self.request.user.profile)

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)


class GameDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Game.objects.filter(profile=self.request.user.profile)


class ListingList(generics.ListCreateAPIView):
    serializer_class = ListingSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="genre_id",
                description="Filtriraj po ID-u žanra",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="search",
                description="Pretraži po imenu igre",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="min_grade",
                description="Filtriraj po minimalnoj ocjeni",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="max_grade",
                description="Filtriraj po maksimalnoj ocjeni",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="min_players",
                description="Filtriraj po minimalnom broju igrača",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="max_players",
                description="Filtriraj po maksimalnom broju igrača",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="min_playing_time",
                description="Filtriraj po minimalnom vremenu igranja",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="max_playing_time",
                description="Filtriraj po maksimalnom vremenu igranja",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="min_complexity",
                description="Filtriraj po minimalnoj kompleksnosti",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="max_complexity",
                description="Filtriraj po maksimalnoj kompleksnosti",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="publisher",
                description="Filtriraj po izdavaču",
                required=False,
                type=str,
            ),
        ]
    )
    def preform_create(self, serializer):
        game=serializer.validate_data.get("game")
        user_profile = self.request.user.profile

        if game.profile!=user_profile:
            raise ValidationError({
                "game": "This game does not belong to you"
            })
        
        if Listing.objects.filter(game=game, profile=user_profile).exists():
            raise ValidationError({
                "game":"This game is already listed"
            })
        
        serializer.save(profile=user_profile)

    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Listing.objects.all().order_by("-created_at")

        genre_id = self.request.query_params.get("genre_id")
        if genre_id:
            queryset = queryset.filter(game__genre_id=genre_id)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(game__board_game__name__icontains=search)

        min_grade = self.request.query_params.get("min_grade")
        if min_grade:
            queryset = queryset.filter(game__grade__gte=min_grade)

        max_grade = self.request.query_params.get("max_grade")
        if max_grade:
            queryset = queryset.filter(game__grade__lte=max_grade)

        min_players = self.request.query_params.get("min_players")
        if min_players:
            queryset = queryset.filter(game__board_game__max_players__gte=min_players)

        max_players = self.request.query_params.get("max_players")
        if max_players:
            queryset = queryset.filter(game__board_game__min_players__lte=max_players)

        min_playing_time = self.request.query_params.get("min_playing_time")
        if min_playing_time:
            queryset = queryset.filter(game__board_game__playing_time__gte=min_playing_time)

        max_playing_time = self.request.query_params.get("max_playing_time")
        if max_playing_time:
            queryset = queryset.filter(game__board_game__playing_time__lte=max_playing_time)

        min_complexity = self.request.query_params.get("min_complexity")
        if min_complexity:
            queryset = queryset.filter(game__board_game__complexity__gte=min_complexity)

        max_complexity = self.request.query_params.get("max_complexity")
        if max_complexity:
            queryset = queryset.filter(game__board_game__complexity__lte=max_complexity)

        publisher = self.request.query_params.get("publisher")
        if publisher:
            queryset = queryset.filter(game__publisher__icontains=publisher)

        profile_id = self.request.query_params.get("profile_id")
        if profile_id:
            queryset = queryset.filter(game__profile__id=profile_id)

        return queryset

    def perform_create(self, serializer):
        listing = serializer.save(profile=self.request.user.profile)
        
        wishlist_entries = WishlistEntry.objects.filter(game__board_game=listing.game.board_game)
        for entry in wishlist_entries:
            if entry.profile != listing.profile:
                Notification.objects.create(
                    recieved_profile=entry.profile,
                    profile=listing.profile,
                    description=f"Good news! {listing.game.board_game.name} from your wishlist is now available!",
                    swap_offer=None
                )


class ListingDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.get_object().profile != self.request.user.profile:
            raise PermissionError("You can only edit your own listings.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.profile != self.request.user.profile:
            raise PermissionError("You can only delete your own listings.")
        instance.delete()


class WishlistListCreate(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistEntry.objects.filter(profile=self.request.user.profile)

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)


class WishlistDetail(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistEntry.objects.filter(profile=self.request.user.profile)


class SwapOfferListCreate(generics.ListCreateAPIView):
    serializer_class = SwapOfferSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="status",
                description="Filtriraj po statusu zamjene",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="start_date",
                description="Filtriraj po početnom datumu",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="end_date",
                description="Filtriraj po završnom datumu",
                required=False,
                type=str,
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user_profile = self.request.user.profile
        queryset = (
            SwapOffer.objects.filter(Q(proposer=user_profile) | Q(target=user_profile))
            .distinct()
            .order_by("-updated_at")
        )

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        start_date = self.request.query_params.get("start_date")
        if start_date:
            queryset = queryset.filter(updated_at__date__gte=start_date)

        end_date = self.request.query_params.get("end_date")
        if end_date:
            queryset = queryset.filter(updated_at__date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        offer = serializer.save(proposer=self.request.user.profile)

        Notification.objects.create(
            recieved_profile=offer.target,
            profile=offer.proposer,
            description=f"New swap offer from {offer.proposer.user.username}",
            swap_offer=offer,
        )


class SwapOfferDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SwapOfferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        return SwapOffer.objects.filter(
            Q(proposer=user_profile) | Q(target=user_profile)
        ).distinct()

    def perform_update(self, serializer):
        instance = self.get_object()
        user_profile = self.request.user.profile

        updated_offer = serializer.save()

        recieved_profile = (
            instance.target if user_profile == instance.proposer else instance.proposer
        )
        Notification.objects.create(
            recieved_profile=recieved_profile,
            profile=user_profile,
            description=f"Swap offer updated by {user_profile.user.username}",
            swap_offer=updated_offer,
        )

    def perform_destroy(self, instance):
        instance.delete()


class SwapOfferAccept(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            offer = SwapOffer.objects.get(pk=pk)
        except SwapOffer.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.profile != offer.target:
            return Response(
                {"detail": "Only the target can accept the offer."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if offer.status != "PENDING":
            return Response(
                {"detail": "Offer is not pending."}, status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            offer.status = "ACCEPTED"
            offer.save()

            offered_game_ids = list(offer.offered_games.values_list('id', flat=True))
            requested_game_ids = list(offer.requested_games.values_list('id', flat=True))
            all_involved_game_ids = offered_game_ids + requested_game_ids

            conflicting_offers = SwapOffer.objects.filter(
                status="PENDING"
            ).exclude(
                pk=offer.pk  # Isključi trenutnu ponudu koju upravo prihvaćamo
            ).filter(
                Q(offered_games__id__in=all_involved_game_ids) | 
                Q(requested_games__id__in=all_involved_game_ids)
            ).distinct()

            conflicting_offers.update(status="CANCELLED")

            # Transfer igara
            for game in offer.offered_games.all():
                game.profile = offer.target
                #game.active = False
                game.save()
                Listing.objects.filter(game_id=game.id).delete()

            for game in offer.requested_games.all():
                game.profile = offer.proposer
                #game.active = False
                game.save()
                Listing.objects.filter(game_id=game.id).delete()

            Notification.objects.create(
                recieved_profile=offer.proposer,
                profile=offer.target,
                description=f"{offer.target.user.username} accepted your swap offer!",
                swap_offer=offer,
            )

        return Response(SwapOfferSerializer(offer).data)


class SwapOfferReject(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            offer = SwapOffer.objects.get(pk=pk)
        except SwapOffer.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.profile != offer.target:
            return Response(
                {"detail": "Only the target can reject the offer."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if offer.status != "PENDING":
            return Response(
                {"detail": "Offer is not pending."}, status=status.HTTP_400_BAD_REQUEST
            )

        offer.status = "REJECTED"
        offer.save()

        Notification.objects.create(
            recieved_profile=offer.proposer,
            profile=offer.target,
            description=f"{offer.target.user.username} rejected your swap offer.",
            swap_offer=offer,
        )

        return Response(SwapOfferSerializer(offer).data)


class NotificationList(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recieved_profile=self.request.user.profile
        ).order_by("-time")


class NotificationMarkRead(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if notif.recieved_profile != request.user.profile:
            return Response(
                {"detail": "Not your notification."}, status=status.HTTP_403_FORBIDDEN
            )

        notif.read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)


class BoardGameAutocompleteView(generics.ListAPIView):
    serializer_class = BoardGameSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="query",
                description="Search query for board game names",
                required=True,
                type=str,
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        query = self.request.query_params.get("query", "")
        if len(query) < 2:
            return BoardGame.objects.none()
        return BoardGame.objects.filter(name__istartswith=query)[:10]


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            PushSubscription.objects.update_or_create(
                user=request.user,
                endpoint=serializer.validated_data['endpoint'],
                defaults={
                    'p256dh': serializer.validated_data['p256dh'],
                    'auth': serializer.validated_data['auth']
                }
            )
            return Response({"detail": "Subscribed"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnsubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get("endpoint")
        if endpoint:
            PushSubscription.objects.filter(user=request.user, endpoint=endpoint).delete()
        return Response({"detail": "Unsubscribed"}, status=status.HTTP_200_OK)


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            PushSubscription.objects.update_or_create(
                user=request.user,
                endpoint=serializer.validated_data['endpoint'],
                defaults={
                    'p256dh': serializer.validated_data['p256dh'],
                    'auth': serializer.validated_data['auth']
                }
            )
            return Response({"detail": "Subscribed"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnsubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get("endpoint")
        if endpoint:
            PushSubscription.objects.filter(user=request.user, endpoint=endpoint).delete()
        return Response({"detail": "Unsubscribed"}, status=status.HTTP_200_OK)

class BoardGameDetail(generics.RetrieveAPIView):
    queryset = BoardGame.objects.all()
    serializer_class = BoardGameDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'bgg_id'
