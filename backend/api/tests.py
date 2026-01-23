from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
import json
from .models import Game, SwapOffer, Notification, BoardGame, Listing, Report, WishlistEntry


class TradingFlowTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(username="usera", password="password123")
        self.user_b = User.objects.create_user(username="userb", password="password123")

        self.profile_a = self.user_a.profile
        self.profile_b = self.user_b.profile

        self.bgg_catan = BoardGame.objects.create(
            bgg_id=13,
            name="Catan",
            min_players=3,
            max_players=4,
            playing_time=60,
            complexity=2.3
        )
        self.bgg_monopoly = BoardGame.objects.create(
            bgg_id=140,
            name="Monopoly",
            min_players=2,
            max_players=8,
            playing_time=120,
            complexity=1.6
        )

    def test_full_trading_scenario(self):
        """
        Testira cijeli tok:
        1. User A dodaje igru (UC-08)
        2. User B dodaje igru
        3. User A šalje zahtjev za zamjenu
        4. User B uređuje zahtjev (UC-13)
        5. User B prihvaća zahtjev
        6. Provjera prijenosa vlasništva i notifikacija (UC-14)
        """

        # --- KORAK 1: User A dodaje Catan ---
        self.client.force_authenticate(user=self.user_a)
        game_data_a = {
            "board_game_id": self.bgg_catan.id,
            "description": "Trading game",
            "publisher": "Kosmos",
            "grade": 5,
            "active": True,
        }
        response = self.client.post("/api/games/", game_data_a)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        game_catan_id = response.data["id"]

        # --- KORAK 2: User B dodaje Monopoly ---
        self.client.force_authenticate(user=self.user_b)
        game_data_b = {
            "board_game_id": self.bgg_monopoly.id,
            "description": "Property trading",
            "publisher": "Hasbro",
            "grade": 4,
            "active": True,
        }
        response = self.client.post("/api/games/", game_data_b)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        game_monopoly_id = response.data["id"]

        # --- KORAK 3: User A šalje ponudu za zamjenu ---
        self.client.force_authenticate(user=self.user_a)
        swap_data = {
            "target_id": self.profile_b.id,
            "offered_game_ids": [game_catan_id],
            "requested_game_ids": [game_monopoly_id],
        }
        response = self.client.post("/api/swaps/", swap_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        swap_id = response.data["id"]

        offer = SwapOffer.objects.get(id=swap_id)
        self.assertEqual(offer.status, "PENDING")

        notif_b = Notification.objects.filter(recieved_profile=self.profile_b).latest(
            "time"
        )
        self.assertIn("New swap offer", notif_b.description)

        # --- KORAK 4: User B uređuje ponudu ---
        self.client.force_authenticate(user=self.user_b)
        edit_data = {
            "offered_game_ids": [game_catan_id],
            "requested_game_ids": [game_monopoly_id],
        }

        response = self.client.put(f"/api/swaps/{swap_id}/", edit_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notif_a = Notification.objects.filter(recieved_profile=self.profile_a).latest(
            "time"
        )
        self.assertIn("Swap offer updated", notif_a.description)

        # --- KORAK 5: User B prihvaća ponudu ---
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post(f"/api/swaps/{swap_id}/accept/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # --- KORAK 6: Finalna provjera stanja ---

        offer.refresh_from_db()
        self.assertEqual(offer.status, "ACCEPTED")

        catan = Game.objects.get(id=game_catan_id)
        monopoly = Game.objects.get(id=game_monopoly_id)

        self.assertEqual(catan.profile, self.profile_b)
        self.assertEqual(monopoly.profile, self.profile_a)

        notif_final_a = (
            Notification.objects.filter(recieved_profile=self.profile_a)
            .order_by("-time")
            .first()
        )
        self.assertIn("accepted your swap offer", notif_final_a.description)

class ReportingListing(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(username="usera", password="password123")
        self.user_b = User.objects.create_user(username="userb", password="password123")

        self.profile_a = self.user_a.profile
        self.profile_b = self.user_b.profile

        self.bgg_catan = BoardGame.objects.create(
            bgg_id=13,
            name="Catan",
            min_players=3,
            max_players=4,
            playing_time=60,
            complexity=2.3
        )
        self.bgg_monopoly = BoardGame.objects.create(
            bgg_id=140,
            name="Monopoly",
            min_players=2,
            max_players=8,
            playing_time=120,
            complexity=1.6
        )
        self.g_usera_catan=Game.objects.create(
            board_game=self.bgg_catan,
            description="Opis",
            photo="",
            publisher="Izdavač",
            grade=4,
            active=True,
            profile=self.profile_a
        )

        self.l_usera_catan=Listing.objects.create(
            description="Opis",
            profile=self.profile_a,
            game=self.g_usera_catan
        )
    
    def test_create_report_success(self):
        self.client.force_login(user=self.user_a) #kada se koristi force_login u setttings mora biti postavljeno 
        self.client.force_login(user=self.user_b) #SesssionAuthentication
        data={"target_listing":self.l_usera_catan.id,
              "description":"Ovaj oglas je prevara"}
        
        response = self.client.post("/api/reports/",
                                    data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Report.objects.count(),1)

        report = Report.objects.first()
        self.assertEqual(report.sender, self.profile_b)

    def test_create_report_failure1(self):
        self.client.force_login(user=self.user_a)
        data={"target_listing":self.l_usera_catan.id,
              "description":"Ovaj oglas je prevara"}
        response=self.client.post("/api/reports/",
                                  data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Report.objects.count(), 0)

    def test_create_report_failure2(self):
        self.client.force_login(user=self.user_b)
        self.report_usera=Report.objects.create(
            sender=self.profile_b,
            target_listing=self.l_usera_catan,
            description="Prijava"
        )

        data={"target_listing":self.l_usera_catan.id,
              "description":"Ovaj oglas je prevara"}
        
        response = self.client.post("/api/reports/",
                                    data, format="json")
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Report.objects.count(),1)

class CreateListing(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(username="usera", password="password123")

        self.profile_a = self.user_a.profile

        self.bgg_catan = BoardGame.objects.create(
            bgg_id=13,
            name="Catan",
            min_players=3,
            max_players=4,
            playing_time=60,
            complexity=2.3
        )

        self.g_usera_catan=Game.objects.create(
            board_game=self.bgg_catan,
            description="Opis",
            photo="",
            publisher="Izdavač",
            grade=4,
            active=True,
            profile=self.profile_a
        )

    def test_create_listing_success(self):
        self.client.force_login(user=self.user_a)

        data={
            "description":"Opis",
            "game_id":self.g_usera_catan.id
        }
        
        response=self.client.post("/api/listings/", data, format="json")

        self.assertEqual(response.status_code,201)
        self.assertEqual(Listing.objects.count(),1)
        listing = Listing.objects.first()
        self.assertEqual(listing.profile, self.profile_a)

    def test_create_listing_failure(self):
        self.client.force_login(user=self.user_a)
        self.listing_user_a=Listing.objects.create(
            description="Opis",
            profile=self.profile_a,
            game=self.g_usera_catan
        )
        data={
            "description":"Opis",
            "game_id":self.g_usera_catan.id
        }
        
        response=self.client.post("/api/listings/", data,format="json")

        self.assertEqual(response.status_code,400)
        self.assertEqual(Listing.objects.count(),1)

class WishlistEntryNew(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(username="usera", password="password123")

        self.profile_a = self.user_a.profile

        self.bgg_catan = BoardGame.objects.create(
            bgg_id=13,
            name="Catan",
            min_players=3,
            max_players=4,
            playing_time=60,
            complexity=2.3
        )

    def test_new_wishlist_entry_success(self):
        self.client.force_login(user=self.user_a)
        data={
            "board_game_id":self.bgg_catan.id
        }
        response=self.client.post("/api/wishlist/", data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(WishlistEntry.objects.count(),1)

    def test_new_wishlist_entry_failure(self):
        self.client.force_login(user=self.user_a)
        self.w_usera=WishlistEntry.objects.create(
            board_game_id=self.bgg_catan.id,
            profile=self.profile_a
        )
        data={
            "board_game_id":self.bgg_catan.id,
        }
        response=self.client.post("/api/wishlist/", data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(WishlistEntry.objects.count(),1)
