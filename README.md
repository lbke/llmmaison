# LLM Maison 2025 🤖🏡

Un site web Astro.js pour documenter et partager les installations LLM de la communauté française.

## Fonctionnalités

- 📊 **Parsing automatique** de fichiers CSV de données d'enquête
- 🤖 **Enrichissement IA** avec titres SEO et descriptions générés par Mistral AI  
- 📱 **Design responsive** optimisé pour mobile avec Tailwind CSS
- 🔍 **SEO optimisé** avec métadonnées dynamiques
- 🎨 **Interface moderne** avec composants réutilisables
- 📁 **Pages dynamiques** générées pour chaque installation

## Structure du projet

```
├── src/
│   ├── components/          # Composants Astro réutilisables
│   ├── layouts/            # Layouts de page
│   ├── pages/              # Pages du site
│   │   ├── index.astro     # Page d'accueil
│   │   └── installation/   # Pages dynamiques des installations
│   ├── schemas/            # Schémas Zod pour validation
│   ├── scripts/            # Scripts de traitement des données
│   └── utils/              # Utilitaires de chargement de données
├── data/
│   └── processed/          # Données CSV traitées
└── public/                 # Assets statiques
```

## Installation

```bash
npm install
```

## Configuration

1. Copiez `.env.example` vers `.env`
2. Ajoutez votre clé API Mistral :
```env
MISTRAL_API_KEY=votre_clé_mistral_ici
```

## Scripts de traitement des données

### 1. Parser les données brutes

NOTE: le slug = l'URL de l'installation est calculé à cette étape de manière déterministe

```bash
mkdir ./data/processed/$(date +%F)
npm run parse ./data/raw/$(date +%F).csv ./data/processed/$(date +%F)/parsed-data.csv
```
Transforme le CSV brut en données avec des noms de champs propres et génère des slugs uniques.

### 2. Enrichir avec l'IA (optionnel)

NOTE: déclenche un appel LLM sur chaque donnée (pour l'instant pas de mécanisme pour relancer le calcul sur les nouvelles données uniquement)

```bash
npm run enrich ./data/processed/$(date +%F)/parsed-data.csv ./data/processed/$(date +%F)/enriched-data.csv
```
Génère des titres SEO, descriptions et titres H1 optimisés avec Mistral AI.

Si tout va bien copier vers le dossier latest : 

```sh
rm -Rf ./data/processed/latest ./public/data/latest
cp -R "./data/processed/$(date +%F)" ./data/processed/latest
cp -R "./data/processed/latest" ./public/data/latest
```

## Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build
npm run preview
```

## Structure des données

### CSV d'entrée
Le fichier CSV doit contenir les colonnes suivantes (basées sur le formulaire Google Forms) :
- Horodateur
- Questions de licence et acceptation
- Type d'installation et configuration
- Détails matériel et logiciel
- Coûts et performances
- Informations de contact

### Schémas Zod

- **RawData** : Validation des données brutes du CSV
- **ParsedData** : Données avec noms de champs simplifiés + slug
- **EnrichedData** : Données enrichies avec champs IA générés

## Composants

### Composants de réponse
- `StringResponse` : Affichage de réponses textuelles
- `SingleChoiceResponse` : Choix unique avec options visualisées  
- `MultipleChoiceResponse` : Choix multiples avec cases à cocher
- `InstallationCard` : Carte de présentation d'une installation

### Composants utilitaires
- `ContributeBanner` : Bannière d'invitation à participer
- `Layout` : Template de base avec SEO et navigation

## Pages

### Page d'accueil (`/`)
- Section héro avec titre et description
- Section de texte en 2 colonnes
- Bannière de contribution
- Grille de 10 installations aléatoires

### Pages d'installation (`/installation/[slug]`)
- En-tête avec informations principales
- Sections détaillées des réponses au questionnaire
- Bannière de contribution
- Suggestions d'autres installations

## Gestion des erreurs

- Les appels LLM échoués utilisent des valeurs par défaut
- Les données manquantes sont gracieusement ignorées
- Fallback vers les données parsées si l'enrichissement échoue

## Déploiement

Le site génère des pages statiques compatibles avec tous les hébergeurs :
- Vercel, Netlify, GitHub Pages
- Serveurs statiques traditionnels
- CDN

## Licence

Données sous licence CC-0. Code source sous licence MIT.