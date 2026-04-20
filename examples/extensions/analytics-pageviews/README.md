# Analytics maison

Mini-tracker de pages vues, **100% local** (rien n'est envoyé sur internet, tout est stocké dans `localStorage`).

Une fois installé, le dashboard apparaît directement sous l'extension dans Admin → Extensions, avec :

- Vues totales, sessions uniques, vues sur 24h
- Top 10 des pages
- Histogramme sur 14 jours

## Limites

- Données isolées par navigateur (pas multi-utilisateurs).
- Plafonné à 5000 événements (rotation automatique des plus anciens).
- Une "session" = nouvelle visite après 30min d'inactivité.
