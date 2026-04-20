# Tickets RP

Permet aux joueurs d'ouvrir des tickets de signalement, de question ou de bug. Bouton flottant côté visiteur, dashboard de modération côté admin (avec changement de statut Open → In progress → Closed).

> Données stockées en `localStorage` et synchronisées entre les onglets ouverts du même navigateur via `BroadcastChannel`. Pour partager les tickets entre tous les visiteurs, il faut un backend (version pro à venir).

## Settings

| Clé              | Type    | Défaut         | Description                                                |
| ---------------- | ------- | -------------- | ---------------------------------------------------------- |
| `buttonLabel`    | string  | `"Signaler"`   | Libellé du bouton flottant                                 |
| `position`       | enum    | `"top-left"`   | `"top-left"` ou `"bottom-left"`                            |
| `accentColor`    | string  | `"#ff8c42"`    | Couleur du bouton et du modal                              |
| `allowAnonymous` | boolean | `false`        | Si vrai, autorise les non-connectés à ouvrir un ticket     |

## Types de tickets

- **Signalement** : violation de règle, comportement RP problématique
- **Question** : demande d'aide générale
- **Bug technique** : problème serveur / script
