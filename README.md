# MYTRUCK MATE V2

Version de test indépendante de l'application de production.

## Reconstruction de l'accueil
Le travail de refonte est isolé sur la branche `reconstruction-propre`.
- `index.html` : structure de l'accueil et points d'entrée des fonctionnalités.
- `assets/css/home.css` : styles dédiés à l'accueil.
- `assets/js/home.js` : logique d'authentification, météo, primes, activité et navigation.
- `REBUILD-AUDIT.md` : inventaire des pages, dépendances, données et règles de nettoyage.

Les pages métier existantes sont conservées pendant la reconstruction. Ne pas fusionner vers `main` avant validation.
