#!/bin/bash
# Script de démarrage Railway pour Laravel

echo "🚀 Démarrage de Rhapsody API sur Railway"

# 1. Installation des dépendances
composer install --no-dev --optimize-autoloader --no-interaction

# 2. Génération de la clé d'application si nécessaire
php artisan key:generate --force --no-interaction

# 3. Exécution des migrations
php artisan migrate --force --no-interaction

# 4. Optimisation de l'application
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Création du lien symbolique pour le storage
php artisan storage:link

# 6. Démarrage du serveur
echo "✅ Application prête !"
php artisan serve --host=0.0.0.0 --port=$PORT
