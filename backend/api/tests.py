from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Game, SwapOffer, Notification


class TradingFlowTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_a = User.objects.create_user(username="usera", password="password123")
        self.user_b = User.objects.create_user(username="userb", password="password123")

        self.profile_a = self.user_a.profile
        self.profile_b = self.user_b.profile

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
            "name": "Catan",
            "description": "Trading game",
            "publisher": "Kosmos",
            "grade": 5,
            "number_of_players": 4,
            "playing_time": 60,
            "complexity": 3,
            "active": True,
        }
        response = self.client.post("/api/games/", game_data_a)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        game_catan_id = response.data["id"]

        # --- KORAK 2: User B dodaje Monopoly ---
        self.client.force_authenticate(user=self.user_b)
        game_data_b = {
            "name": "Monopoly",
            "description": "Property trading",
            "publisher": "Hasbro",
            "grade": 4,
            "number_of_players": 6,
            "playing_time": 120,
            "complexity": 2,
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

        self.assertEqual(catan.borrower_profile, self.profile_b)
        self.assertFalse(catan.active)

        self.assertEqual(monopoly.borrower_profile, self.profile_a)
        self.assertFalse(monopoly.active)

        notif_final_a = (
            Notification.objects.filter(recieved_profile=self.profile_a)
            .order_by("-time")
            .first()
        )
        self.assertIn("accepted your swap offer", notif_final_a.description)
