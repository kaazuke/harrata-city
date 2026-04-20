# Hub communautaire FiveM — infos bêta, installation & contact

Document prêt à **copier-coller** (forum, Discord, README projet, annonce).  
**Contact & questions (bêta)** : uniquement sur Discord — **https://discord.gg/7XVtaRnpQe**

---

## Texte court (réseaux / signature)

**FiveM RP Community Hub** — site démo open source (Next.js) : accueil, règles, actus, forum, boutique, admin. En **bêta** : contenus d’exemple, évolutions possibles.  
**Démo** : https://fivem-rp-community.vercel.app/fr  
**Code** : https://github.com/kaazuke/harrata-city  
**Infos & support** : https://discord.gg/7XVtaRnpQe

---

## Statut : bêta

- Le site en ligne est une **démonstration** du template : textes, chiffres et liens d’exemple peuvent changer.
- **Pas de support email officiel** pour la bêta : toutes les questions (installation, bug, idée) passent par le **Discord** ci-dessus.
- Les **données sensibles** (secrets OAuth, etc.) restent dans les **variables d’environnement** et ne doivent pas être commitées (voir `.gitignore`).

---

## Ce que le site propose (fonctionnalités)

| Zone | Description |
|------|-------------|
| **Accueil** | Hero, bloc serveur (statique ou live si Cfx.re / `players.json` configurés), tuiles, actus, stats, lien forum |
| **Présentation** | Lore / points forts / médias (images, YouTube) |
| **Règlement** | Catégories + recherche + ancres URL |
| **Candidatures** | Formulaires whitelist / staff / entreprise (champs éditables admin + webhook Discord possible) |
| **Boutique** | Grille produits type Tebex (lien boutique externe configurable) |
| **Équipe** | Membres staff (+ option comptes liés) |
| **Actualités** | Articles / patch notes avec slug |
| **Forum** | Catégories, sujets, réponses (stockage selon config) |
| **Galerie** | Images / vidéos |
| **Statistiques** | Cartes + graphiques (données de démo ou les vôtres) |
| **Contact** | Formulaire (+ webhook optionnel) |
| **Comptes** | Connexion / inscription **Discord** + **Steam** (OAuth) |
| **Admin** | Édition du contenu du site (thème, navigation, textes, modules…) |
| **i18n** | **FR** et **EN** avec URLs `/fr/...` et `/en/...` |
| **Hub open source** | Page dédiée au projet : https://fivem-rp-community.vercel.app/fr/hub-open-source |

---

## Outils & stack technique

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4**
- **next-intl** (traductions)
- **Vercel** (démo) ou tout hébergeur compatible Node
- **API** : auth Discord/Steam, proxy statut serveur FiveM, contact, formulaires, uploads marketplace (selon config)
- **Licence** : MIT (détails dans le dépôt GitHub)

---

## Pour installer le site (résumé)

1. **Prérequis** : Node.js ≥ 20, npm ≥ 10, compte **Discord Developer** (OAuth), clé **Steam** (optionnelle).
2. **Cloner** : `git clone https://github.com/kaazuke/harrata-city.git` puis `cd harrata-city` et `npm install`.
3. **Variables d’environnement** : créer `.env.local` (voir le **README** du repo pour la liste complète : `AUTH_SECRET`, `DISCORD_*`, `STEAM_*`, `NEXT_PUBLIC_SITE_URL`, `DISCORD_WEBHOOK_URL`, etc.).
4. **Lancer** : `npm run dev` → http://localhost:3000  
5. **Production** : `npm run build` puis `npm run start`, ou déploiement **Vercel** (import du repo + mêmes variables d’env).
6. **Première visite admin** : suivre le flux d’**initialisation administrateur** si proposé, puis personnaliser textes, liens, modules.

Détail pas à pas : fichier **README.md** à la racine du dépôt.

---

## Liens utiles (à partager tels quels)

| Ressource | URL |
|-----------|-----|
| Démo FR | https://fivem-rp-community.vercel.app/fr |
| Démo EN | https://fivem-rp-community.vercel.app/en |
| Page projet (open source) | https://fivem-rp-community.vercel.app/fr/hub-open-source |
| Dépôt GitHub | https://github.com/kaazuke/harrata-city |
| **Discord (infos & contact bêta)** | **https://discord.gg/7XVtaRnpQe** |

---

## Formulation « officielle » contact (1 phrase)

> Pendant la phase bêta, les questions sur l’installation, le déploiement et l’utilisation du hub se font sur le Discord du projet : **https://discord.gg/7XVtaRnpQe** — merci de ne pas utiliser d’autre canal pour le support.

---

*Dernière mise à jour : cohérente avec la démo « Hub RP — démo » et le README du dépôt.*
