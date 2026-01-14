import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_profile_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='wishlistentry',
            name='board_game',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='wishlisted_by', to='api.boardgame'),
        ),
        migrations.AlterUniqueTogether(
            name='wishlistentry',
            unique_together={('profile', 'board_game')},
        ),
        migrations.RemoveField(
            model_name='wishlistentry',
            name='game',
        ),
        migrations.AlterField(
            model_name='wishlistentry',
            name='board_game',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlisted_by', to='api.boardgame'),
        ),
    ]
