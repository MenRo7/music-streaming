#!/bin/bash
# Script de démarrage Railway pour Laravel

echo "🚀 Démarrage de Rhapsody API sur Railway"

# 1. Installation des dépendances
composer install --no-dev --optimize-autoloader --no-interaction

# 2. Vérification de la clé d'application (configurée via variables Railway)
if [ -z "$APP_KEY" ]; then
  echo "⚠️  WARNING: APP_KEY not set!"
  exit 1
fi

# 3. Nettoyage du cache (important pour les variables d'environnement)
echo "🧹 Nettoyage du cache..."
php artisan config:clear || true
php artisan cache:clear || true

# 4. Exécution des migrations
echo "🗄️  Exécution des migrations..."
php artisan migrate --force --no-interaction

# 5. Optimisation de l'application
echo "⚡ Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Création du lien symbolique pour le storage
php artisan storage:link

# 6. Démarrage du serveur
echo "✅ Application prête !"
php artisan serve --host=0.0.0.0 --port=$PORT
