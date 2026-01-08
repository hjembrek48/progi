import csv
import os
from django.core.management.base import BaseCommand
from api.models import BoardGame


class Command(BaseCommand):
    help = "Load BoardGames from CSV"

    def handle(self, *args, **options):
        file_path = os.path.join(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                )
            ),
            "games.csv",
        )

        if not os.path.exists(file_path):
            file_path = "games.csv"

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File {file_path} not found."))
            return

        self.stdout.write(f"Reading from {file_path}...")

        with open(file_path, "r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            games_to_create = []
            count = 0

            def parse_int(value):
                try:
                    return int(float(value))
                except (ValueError, TypeError):
                    return None

            def parse_float(value):
                try:
                    return float(value)
                except (ValueError, TypeError):
                    return None

            existing_ids = set(BoardGame.objects.values_list("bgg_id", flat=True))

            for row in reader:
                try:
                    bgg_id = parse_int(row.get("game_id"))
                    if not bgg_id:
                        continue

                    if bgg_id in existing_ids:
                        continue

                    existing_ids.add(bgg_id)

                    game = BoardGame(
                        bgg_id=bgg_id,
                        name=row.get("names", "")[:255],
                        min_players=parse_int(row.get("min_players")),
                        max_players=parse_int(row.get("max_players")),
                        playing_time=parse_int(row.get("avg_time")),
                        min_playtime=parse_int(row.get("min_time")),
                        max_playtime=parse_int(row.get("max_time")),
                        year_published=parse_int(row.get("year")),
                        image_url=row.get("image_url", ""),
                        rank=parse_int(row.get("rank")),
                        rating=parse_float(row.get("avg_rating")),
                        complexity=parse_float(row.get("weight")),
                    )
                    games_to_create.append(game)
                    count += 1

                    if len(games_to_create) >= 5000:
                        BoardGame.objects.bulk_create(games_to_create)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Created batch of {len(games_to_create)} games..."
                            )
                        )
                        games_to_create = []
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Error processing row {row.get("game_id")}: {e}'
                        )
                    )

            if games_to_create:
                BoardGame.objects.bulk_create(games_to_create)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created final batch of {len(games_to_create)} games."
                    )
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully loaded games."))
