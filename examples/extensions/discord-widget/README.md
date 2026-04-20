# Discord widget

Affiche un encart compact en bas du site avec les membres Discord en ligne et un bouton "Rejoindre le Discord".

## Prérequis

Activez le widget sur votre serveur Discord :
1. Paramètres du serveur → **Widget**
2. Cochez **Activer le widget du serveur**
3. Récupérez l'**ID du serveur** (clic droit sur l'icône → Copier l'identifiant)

## Settings

| Clé                | Type    | Défaut         | Description                                            |
| ------------------ | ------- | -------------- | ------------------------------------------------------ |
| `serverId`         | string  | `""`           | ID du serveur Discord (snowflake)                      |
| `refreshSeconds`   | number  | `60`           | Intervalle de rafraîchissement (min 15s)               |
| `position`         | enum    | `"bottom-left"`| `"bottom-left"` ou `"top-left"`                        |
| `inviteUrl`        | string  | `""`           | URL d'invitation perso (sinon utilise celle du widget) |
| `accentColor`      | string  | `"#5865F2"`    | Couleur (par défaut blurple Discord)                   |
| `collapsedByDefault`| boolean| `true`         | Affichage initial réduit en bouton                     |
