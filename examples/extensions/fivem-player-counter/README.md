# Compteur joueurs FiveM live

Widget flottant qui appelle directement l'endpoint `/players.json` de votre serveur FiveM et affiche le compte de joueurs en temps réel.

## Settings

| Clé             | Type   | Défaut             | Description                                              |
| --------------- | ------ | ------------------ | -------------------------------------------------------- |
| `serverUrl`     | string | `""`               | URL HTTP de votre serveur (ex: `http://1.2.3.4:30120`)   |
| `refreshSeconds`| number | `30`               | Intervalle de rafraîchissement (min 5s)                  |
| `label`         | string | `"Joueurs FiveM"`  | Libellé affiché                                          |
| `position`      | enum   | `"top-right"`      | `"top-right"` ou `"top-left"`                            |
| `accentColor`   | string | `"#52e3a3"`        | Couleur du widget                                        |
| `maxPlayers`    | number | `64`               | Nombre de slots (pour la barre de remplissage)           |

## Limite CORS

Si votre serveur FiveM ne renvoie pas l'en-tête `Access-Control-Allow-Origin: *`, le navigateur bloquera la requête. Solution : passer par un petit reverse-proxy ou activer CORS sur votre artifact server.
