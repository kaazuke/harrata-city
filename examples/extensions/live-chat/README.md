# Chat live

Panneau de chat flottant en bas du site. La synchronisation se fait via l'API `BroadcastChannel` du navigateur — donc en temps réel **entre tous les onglets ouverts du même navigateur**. Les messages sont conservés dans `localStorage` (200 max).

> Pour un vrai chat multi-utilisateurs, il faudrait un backend (WebSocket / Pusher / Ably). Cette extension est conçue comme démonstration et chat local par session.

## Settings

| Clé               | Type     | Défaut                        | Description                                        |
| ----------------- | -------- | ----------------------------- | -------------------------------------------------- |
| `title`           | string   | `"Chat live"`                 | Titre affiché en haut du panneau                   |
| `accentColor`     | string   | `"#7aa2f7"`                   | Couleur du bouton flottant et des messages         |
| `position`        | enum     | `"bottom-right"`              | `"bottom-right"` ou `"bottom-left"`                |
| `maxMessages`     | number   | `60`                          | Nb max de messages affichés (10 - 200)             |
| `slowmodeSeconds` | number   | `0`                           | Délai mini entre 2 messages d'un même utilisateur  |
| `welcomeMessage`  | string   | `"Aucun message…"`            | Texte affiché quand l'historique est vide          |
