# Comptes de test

Ces comptes sont preconfigures par le script SQL de seed.

## Credentials

- Username: alice_demo
- Email: demo.alice@yam.local
- Password: Test123!

- Username: bob_demo
- Email: demo.bob@yam.local
- Password: Test123!

- Username: claire_demo
- Email: demo.claire@yam.local
- Password: Test123!

- Username: david_demo
- Email: demo.david@yam.local
- Password: Test123!

## Injection des donnees

Depuis la racine du projet, avec Docker lance:

PowerShell:

```powershell
docker compose exec postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/002_seed_demo_data.sql'
```

Le script est idempotent: vous pouvez le relancer sans dupliquer les lignes.

## Ce qui est seed

- 4 utilisateurs authentifies (ci-dessus)
- 8 parties terminees (online + bot + match nul)
- game_players coherent avec scores, gagnants et labels
