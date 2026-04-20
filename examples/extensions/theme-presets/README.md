# Theme switcher

Une fois installée, ajoute un bouton 🎨 **Thème** dans la barre du site. Cliquez dessus pour basculer entre 5 presets prêts à l'emploi :

- 🌙 Midnight (par défaut)
- ⚡ Neon
- 🌸 Sakura
- 🌅 Sunset
- 🌿 Mint

Chaque preset modifie en direct les variables `theme.colors` du site (primary, secondary, accent, background, surface, foreground). Le preset actif est persisté dans les settings de l'extension.

## Personnaliser les presets

Vous pouvez fournir vos propres presets dans les settings de l'extension :

```json
{
  "presets": [
    {
      "id": "monrouge",
      "name": "Rouge gangster",
      "emoji": "🩸",
      "colors": {
        "primary": "#ff0040",
        "secondary": "#990000",
        "accent": "#ffaa00"
      }
    }
  ]
}
```
