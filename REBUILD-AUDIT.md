# MYTRUCK MATE V2 — audit et reconstruction propre

Branche de travail : `reconstruction-propre`
Base : `main` (copie de travail indépendante)
La branche `main` et le dépôt de production `TRUCKPILOT` ne sont pas modifiés par cette reconstruction.

## 1. Pages fonctionnelles conservées

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil, connexion/inscription, menu, primes du mois, activité, météo et personnalisation de l'accueil |
| `ma_journee.html` | Saisie et modification d'une journée et de ses transports |
| `detail_journee.html` | Consultation détaillée d'une journée |
| `feuille.html` | Feuille hebdomadaire et impression/PDF |
| `frais.html` | Calcul et réglage des primes |
| `historique.html` | Historique des journées |
| `recapitulatif.html` | Bilans et statistiques |
| `profil.html` | Profil chauffeur, listes et paramètres personnels |
| `service-worker.js` | Cache et fonctionnement PWA hors connexion |
| `manifest.json` / `icon.svg` | Installation de l'application |

## 2. Données et dépendances repérées

- Les pages utilisent notamment les clés locales `truckpilote_daily_entries_v1`, `truckpilote_fee_rates_v1`, `truckpilote_profile`, `truckpilote_profile_v2_metadata` et `truckpilote_profile_name`.
- V2 applique un préfixe `mytruck_mate_v2::` au stockage local afin de séparer les données locales de V2 de celles de l'application de production sur le même navigateur.
- L'authentification utilise Supabase Auth.
- La page d'accueil de V2 bloque volontairement les requêtes Supabase `.from()` en mode test ; la saisie locale reste la source des chiffres de l'accueil.
- Les pages utilisent la bibliothèque Supabase JS depuis jsDelivr. La météo utilise Open-Meteo et le géocodage inversé Nominatim après autorisation de géolocalisation.
- Certaines pages secondaires contiennent encore des appels de synchronisation ou de métadonnées Supabase. Ils doivent être vérifiés avant toute modification de leur fonctionnement ; cette reconstruction ne les réécrit pas.

## 3. Nouvelle architecture de l'accueil

- `index.html` contient désormais la structure HTML et les identifiants fonctionnels attendus par les scripts.
- `assets/css/home.css` contient les styles de l'accueil, séparés des pages métier.
- `assets/js/home.js` contient la logique existante d'authentification, de calcul des primes/activité, de météo, de menu et de personnalisation.
- Le bandeau de l'accueil utilise maintenant `assets/3d/home-scania-hero.webp` (visuel Scania) et non le bandeau à quatre camions.
- L'avatar d'accueil affiche des initiales provisoires ; l'import d'une photo personnelle par chauffeur reste une évolution à réaliser dans le profil.
- Le cache PWA est versionné séparément et précharge les nouveaux fichiers CSS/JS.

## 4. Nettoyage des assets

Les références des pages HTML, CSS et JS ont été comparées à l'arborescence. Plusieurs anciens visuels ne sont plus référencés par le code actif et n'étaient présents que dans la liste de pré-cache du service worker. Ils sont des candidats au nettoyage, pas des fichiers supprimés.

Aucun asset n'est supprimé à cette étape : certains peuvent servir de maquettes de référence pour les prochains sous-menus. Le nettoyage physique sera fait après validation de chaque écran.

## 5. Règles de sécurité de la reconstruction

1. Ne pas modifier `margiinal/TRUCKPILOT` (production).
2. Ne pas fusionner cette branche dans `main` avant validation visuelle et fonctionnelle.
3. Ne pas supprimer les pages métier ni leurs clés de stockage.
4. Valider les parcours connexion, saisie, primes, semaine, historique, bilan et profil avant toute mise en production.
