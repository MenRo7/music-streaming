# 🚀 Guide de Déploiement - Rhapsody Music Streaming

Guide complet pour mettre en production l'application Rhapsody sur **Vercel** (Frontend) et **Railway** (Backend).

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Déploiement Backend (Railway)](#déploiement-backend-railway)
3. [Déploiement Frontend (Vercel)](#déploiement-frontend-vercel)
4. [Configuration Post-Déploiement](#configuration-post-déploiement)
5. [Vérification](#vérification)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Prérequis

### Comptes nécessaires (GRATUITS)

- [ ] Compte GitHub (votre code doit être sur GitHub)
- [ ] Compte Vercel ([vercel.com](https://vercel.com))
- [ ] Compte Railway ([railway.app](https://railway.app))
- [ ] Compte Stripe (mode test OK pour commencer)

### Avant de commencer

```bash
# Vérifier que votre code est bien commité
git status

# Pousser vers GitHub
git push origin main
```

---

## 🔧 Déploiement Backend (Railway)

### Étape 1 : Créer le projet Railway

1. Aller sur [railway.app](https://railway.app)
2. Cliquer sur **"New Project"**
3. Sélectionner **"Deploy from GitHub repo"**
4. Autoriser Railway à accéder à votre GitHub
5. Sélectionner le repository `music-streaming`
6. Railway détecte automatiquement le backend Laravel

### Étape 2 : Configurer la base de données MySQL

1. Dans votre projet Railway, cliquer sur **"+ New"**
2. Sélectionner **"Database" → "Add MySQL"**
3. Railway crée automatiquement une base de données MySQL
4. Récupérer les variables d'environnement de la BDD (elles s'ajoutent automatiquement)

### Étape 3 : Configurer les variables d'environnement

Dans Railway, aller dans **Settings → Variables** et ajouter :

```env
# Application
APP_NAME=Rhapsody
APP_ENV=production
APP_DEBUG=false
APP_KEY=   # Railway générera automatiquement avec php artisan key:generate

# URLs (à mettre à jour après déploiement)
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=https://your-vercel-url.vercel.app

# Sécurité
BCRYPT_ROUNDS=12
FORCE_HTTPS=true
SESSION_SECURE_COOKIE=true
SESSION_SAMESITE=none

# Sanctum (mettre votre URL Vercel)
SANCTUM_STATEFUL_DOMAINS=your-vercel-url.vercel.app

# CORS (mettre votre URL Vercel)
CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
CORS_SUPPORTS_CREDENTIALS=true

# Sessions
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true

# Logs
LOG_CHANNEL=stack
LOG_LEVEL=error

# Mail (Mailgun, SendGrid, SES ou Mailtrap)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@rhapsody.app
MAIL_FROM_NAME=Rhapsody

# Stripe PRODUCTION
STRIPE_KEY=pk_live_XXXXXXXXXX
STRIPE_SECRET=sk_live_XXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXX
```

**IMPORTANT :** Railway connecte automatiquement MySQL via `DATABASE_URL`, pas besoin de configurer `DB_HOST`, `DB_PORT`, etc.

### Étape 4 : Configurer le domaine public

1. Dans Railway, aller dans **Settings → Networking**
2. Cliquer sur **"Generate Domain"**
3. Copier l'URL générée (ex: `rhapsody-production.up.railway.app`)
4. Mettre à jour `APP_URL` avec cette valeur

### Étape 5 : Déploiement

Railway déploie automatiquement ! Suivre les logs dans l'onglet **"Deployments"**.

Le script [railway-start.sh](back/railway-start.sh) s'exécute automatiquement :
- ✅ Installation des dépendances Composer
- ✅ Génération de la clé APP_KEY
- ✅ Migrations de la base de données
- ✅ Optimisation Laravel (cache)
- ✅ Démarrage du serveur

**Temps estimé : 3-5 minutes**

### Étape 6 : Vérifier le backend

Ouvrir dans le navigateur :
```
https://your-app-name.up.railway.app/api/health
```

Vous devriez voir une réponse JSON.

---

## 🎨 Déploiement Frontend (Vercel)

### Étape 1 : Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New... → Project"**
3. Importer votre repository GitHub `music-streaming`
4. Vercel détecte automatiquement React

### Étape 2 : Configurer le projet

**Root Directory :** `front`

**Build Command :** `npm run build`

**Output Directory :** `build`

**Install Command :** `npm install`

### Étape 3 : Configurer les variables d'environnement

Dans Vercel, aller dans **Settings → Environment Variables** et ajouter :

```env
# API URL - METTRE L'URL RAILWAY ICI
REACT_APP_API_URL=https://your-app-name.up.railway.app/api

# Stripe Public Key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX

# Google Analytics (optionnel)
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Étape 4 : Déployer

1. Cliquer sur **"Deploy"**
2. Vercel build et déploie automatiquement
3. **Temps estimé : 2-3 minutes**

### Étape 5 : Récupérer l'URL de production

Vercel génère une URL comme :
```
https://rhapsody-music.vercel.app
```

**IMPORTANT :** Copier cette URL et retourner dans Railway pour mettre à jour :
- `FRONTEND_URL`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

---

## ⚙️ Configuration Post-Déploiement

### 1. Mettre à jour le Backend avec l'URL Frontend

Dans Railway, modifier les variables :

```env
FRONTEND_URL=https://rhapsody-music.vercel.app
SANCTUM_STATEFUL_DOMAINS=rhapsody-music.vercel.app
CORS_ALLOWED_ORIGINS=https://rhapsody-music.vercel.app
```

**Railway redéploiera automatiquement** (1-2 minutes).

### 2. Configurer Stripe Webhooks

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → Webhooks → Add endpoint**
3. URL du endpoint : `https://your-app-name.up.railway.app/api/stripe/webhook`
4. Sélectionner les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copier le **Signing Secret** (commence par `whsec_`)
6. L'ajouter dans Railway : `STRIPE_WEBHOOK_SECRET`

### 3. Configurer le Mail (optionnel)

**Option A : Mailtrap (pour tester)**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
```

**Option B : Mailgun (production)**
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.your-domain.com
MAILGUN_SECRET=key-XXXXXXXXXX
```

**Option C : SendGrid (production)**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.XXXXXXXXXX
```

---

## ✅ Vérification

### Checklist Backend (Railway)

- [ ] L'URL `https://your-app.up.railway.app/api/health` répond
- [ ] La base de données MySQL est connectée
- [ ] Les migrations sont exécutées
- [ ] Les variables d'environnement sont configurées
- [ ] Le webhook Stripe est configuré

### Checklist Frontend (Vercel)

- [ ] L'application s'affiche sur `https://your-app.vercel.app`
- [ ] La connexion API fonctionne (pas d'erreur CORS)
- [ ] L'authentification fonctionne
- [ ] Stripe Checkout fonctionne

### Test de bout en bout

1. **Inscription utilisateur**
   ```
   https://your-app.vercel.app/register
   ```

2. **Connexion**
   ```
   https://your-app.vercel.app/login
   ```

3. **Upload de musique** (utilisateur artiste)

4. **Donation Stripe** (utilisateur auditeur → artiste)

5. **Export RGPD**
   ```
   Profil → Paramètres → Exporter mes données
   ```

---

## 🐛 Troubleshooting

### Erreur CORS sur le frontend

**Symptôme :** `Access-Control-Allow-Origin` error dans la console

**Solution :**
1. Vérifier `CORS_ALLOWED_ORIGINS` dans Railway
2. S'assurer que l'URL Vercel est correcte (sans `/` à la fin)
3. Redéployer Railway après modification

### Erreur 500 sur le backend

**Solution :**
1. Vérifier les logs Railway : **Deployments → View Logs**
2. Vérifier que `APP_KEY` est généré
3. Vérifier que MySQL est connecté
4. Vérifier que les migrations ont réussi

### Les sessions ne persistent pas

**Solution :**
```env
SESSION_SECURE_COOKIE=true
SESSION_SAMESITE=none
SESSION_DOMAIN=
```

### Stripe ne fonctionne pas

**Solution :**
1. Vérifier que `STRIPE_KEY` commence par `pk_live_` (ou `pk_test_`)
2. Vérifier que `STRIPE_SECRET` commence par `sk_live_` (ou `sk_test_`)
3. Vérifier le webhook Stripe sur le dashboard
4. Tester avec `stripe listen --forward-to localhost:8000/api/stripe/webhook` localement

### Build fail sur Vercel

**Solution :**
1. Vérifier que `ROOT_DIRECTORY=front`
2. Vérifier que `BUILD_COMMAND=npm run build`
3. Vérifier que toutes les variables d'environnement commencent par `REACT_APP_`

---

## 🎉 Félicitations !

Votre application Rhapsody est maintenant en production !

**URLs de production :**
- Frontend : `https://rhapsody-music.vercel.app`
- Backend API : `https://rhapsody-production.up.railway.app/api`

**Prochaines étapes :**
- [ ] Configurer un nom de domaine personnalisé (optionnel)
- [ ] Activer Stripe en mode LIVE
- [ ] Configurer Google Analytics
- [ ] Configurer les sauvegardes de la base de données
- [ ] Mettre en place un monitoring (Sentry, Bugsnag)

---

## 📊 Coûts estimés

- **Vercel** : Gratuit (jusqu'à 100 GB bande passante/mois)
- **Railway** :
  - $5/mois pour 500 heures d'exécution
  - $5/mois pour la base de données MySQL (1GB)
  - **Total : ~$10/mois**

**Alternative gratuite pour tests :** Railway offre $5 de crédit gratuit par mois (suffisant pour un projet de démonstration).

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Laravel Deployment](https://laravel.com/docs/deployment)
- [Documentation Stripe](https://stripe.com/docs)

---

**Date de création :** 27 octobre 2025
**Version :** 1.0.0
**Auteur :** Équipe Rhapsody
