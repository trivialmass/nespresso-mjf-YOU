# Trivial YOU

Une application de quiz interactive et ludique construite avec React et Vite. Les utilisateurs répondent à des questions en glissant des cartes à gauche (OUT) ou à droite (IN) sur mobile, ou en utilisant des boutons sur desktop.

## 🎯 À propos

Trivial YOU est un outil de découverte de personnalité et de profil d'entreprise. À travers une série de questions basées sur des traits opposés, l'application génère un profil personnalisé comprenant :

- 👤 **Profil personnel** - Votre personnalité et style
- 🏢 **Profil d'entreprise** - L'énergie et positionnement de votre marque
- 🧭 **Positionnement stratégique** - Vos axes de différenciation
- ✨ **Super-pouvoir de marque** - Votre force unique

## ✨ Fonctionnalités

- 📱 **Cartes glissables** - Gestes de glissement intuitifs sur mobile
- 🖱️ **Support desktop** - Contrôles par boutons et glisser-déposer
- 📊 **Intégration Google Sheets** - Questions dynamiques depuis Google Sheets
- 🤖 **Génération de profil IA** - Profils personnalisés via Infomaniak AI
- 💾 **Sauvegarde automatique** - Résultats enregistrés dans Google Sheets
- 📧 **Partage par email** - Envoi des résultats directement par email
- 🎨 **Interface moderne** - Animations fluides et design épuré
- 📈 **Suivi de progression** - Affichage du numéro de question et du total
- 🔄 **Navigation flexible** - Retour à la question précédente possible

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation

1. **Cloner le dépôt** (ou télécharger les fichiers)

2. **Installer les dépendances** :

```bash
npm install
```

3. **Configurer les variables d'environnement** :

```bash
cp .env.example .env
```

Ouvrez `.env` et configurez :
- `VITE_GOOGLE_SHEETS_API_KEY` - Votre clé API Google Sheets
- `VITE_GOOGLE_SHEET_ID` - L'ID de votre Google Sheet
- `VITE_INFOMANIAK_API_TOKEN` - Token API Infomaniak
- `VITE_INFOMANIAK_PRODUCT_ID` - ID du produit Infomaniak

4. **Démarrer l'application** :

En développement (mode mock) :
```bash
npm run dev
```

En production (avec backend) :
```bash
npm run dev:all
```

L'application sera disponible sur `http://localhost:3000`

## 📊 Configuration Google Sheets

### Structure de la feuille

Votre Google Sheet doit avoir cette structure (colonnes A-F) :

| Question 1 | Description Q1 | Question 2 | Description Q2 | Valeur stratégique | Image |
|-----------|---------------|-----------|---------------|-------------------|-------|
| Classique | ... | Innovante | ... | Innovation | url |
| Accessible | ... | Premium | ... | Accessibilité | url |

### Étapes de configuration

1. **Créer un Google Sheet** avec vos questions
   - Colonne A : Question 1 (trait gauche)
   - Colonne B : Description Question 1
   - Colonne C : Question 2 (trait droit)
   - Colonne D : Description Question 2
   - Colonne E : Valeur stratégique
   - Colonne F : URL d'image de fond (optionnel)

2. **Rendre la feuille publique**
   - Clic droit > Partager > "Toute personne disposant du lien peut consulter"

3. **Activer l'API Google Sheets**
   - Aller sur Google Cloud Console
   - Créer un projet ou sélectionner un existant
   - Activer l'API Google Sheets
   - Créer une clé API

4. **Configurer Apps Script pour la sauvegarde**
   - Dans votre Google Sheet : Extensions > Apps Script
   - Copier le code de sauvegarde (voir [.googleApp-script](.googleApp-script))
   - Déployer comme Web App
   - Mettre à jour l'URL dans `googleSheetsSave.js`

## 🤖 Configuration Infomaniak AI

L'application utilise l'API Infomaniak pour générer les profils via LLM (Large Language Model).

1. **Créer un compte** sur [Infomaniak](https://www.infomaniak.com/)
2. **Activer l'API AI** dans votre produit
3. **Générer un token API**
4. **Ajouter les credentials** dans `.env`

## 📁 Structure du projet

```
trivial-you/
├── src/
│   ├── components/          # Composants React
│   │   ├── QuestionCard.jsx       # Carte de question glissable
│   │   ├── QuestionCard.css
│   │   ├── PopupInscription.jsx   # Formulaire d'inscription
│   │   ├── PopupInscription.css
│   │   ├── Congradulation.jsx     # Écran de félicitations
│   │   ├── Congradulation.css
│   │   ├── Results.jsx            # Affichage des résultats
│   │   └── Results.css
│   ├── services/            # Services API
│   │   ├── googleSheets.js        # Récupération des questions
│   │   ├── googleSheetsSave.js    # Sauvegarde des résultats
│   │   └── llmProfile.js          # Génération de profil IA
│   ├── utils/               # Utilitaires
│   │   └── getMockProfiles.js     # Profils mock pour dev
│   ├── fonts/               # Polices personnalisées
│   ├── logo/                # Assets graphiques
│   ├── App.jsx              # Composant principal
│   ├── Questions.jsx        # Gestion du quiz
│   ├── main.jsx             # Point d'entrée
│   └── *.css                # Styles
├── server.js                # Serveur backend (proxy API)
├── package.json
├── vite.config.js
└── .env                     # Variables d'environnement
```

## 🎮 Utilisation

### Mobile

- Glissez les cartes **à droite (IN)** pour choisir le trait de droite
- Glissez les cartes **à gauche (OUT)** pour choisir le trait de gauche
- Les indicateurs "IN" et "OUT" s'affichent pendant le glissement

### Desktop

- Cliquez sur le **bouton vert "IN"** ou le **bouton rouge "OUT"**
- Ou glissez la carte avec la souris

### Navigation

- **Bouton "Retour"** - Revenir à la question précédente
- **Pagination** - Voir votre progression (ex: 5 / 20)

## 🏗️ Build pour la production

```bash
npm run build
```

Les fichiers compilés seront dans le répertoire `dist/`.

## 🔧 Scripts disponibles

- `npm run dev` - Mode développement (mock data)
- `npm run server` - Démarrer le serveur backend
- `npm run dev:all` - Dev + Backend simultanément
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build

## 🌐 Déploiement

### Frontend (Netlify/Vercel)

1. Connecter votre dépôt Git
2. Configurer les variables d'environnement
3. Définir la commande de build : `npm run build`
4. Définir le répertoire de publication : `dist`

### Backend (Heroku/Railway)

1. Déployer `server.js`
2. Configurer les variables d'environnement
3. Mettre à jour `VITE_BACKEND_URL` dans le frontend

## 🐛 Dépannage

### Les questions ne se chargent pas
- Vérifier que l'API Google Sheets est activée
- Vérifier que la feuille est publique
- Vérifier les credentials dans `.env`

### Les profils ne se génèrent pas
- En développement : Les profils mock devraient fonctionner
- En production : Vérifier que le backend est démarré
- Vérifier les credentials Infomaniak dans `.env`

### Erreurs CORS
- Le serveur backend (`server.js`) gère les requêtes API
- Assurez-vous qu'il est en cours d'exécution : `npm run server`

## 🎨 Personnalisation

### Modifier les couleurs
- Couleur principale : `#a5ff02` (vert néon)
- Couleur secondaire : `#FF6A7B` (rouge)
- Voir [src/App.css](src/App.css) et [src/components/QuestionCard.css](src/components/QuestionCard.css)

### Modifier les polices
- Police principale : Helvetica Neue
- Voir [src/fonts/fonts.css](src/fonts/fonts.css)

### Modifier le prompt IA
- Éditer [server.js](server.js), section `userPrompt`

## 📄 Licence

MIT

## 🙏 Remerciements

- React & Vite
- Google Sheets API
- Infomaniak AI
- Helvetica Neue font family

---

**Développé par Trivial Mass** - [trivialmass.ch](https://trivialmass.ch/)
