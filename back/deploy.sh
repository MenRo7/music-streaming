#!/bin/bash
# Script de déploiement automatisé - Rhapsody Backend
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Arrêt immédiat en cas d'erreur

ENVIRONMENT=${1:-production}

echo "🚀 Déploiement backend Rhapsody - Environnement: $ENVIRONMENT"
echo "================================================================"

# 1. Mise à jour des dépendances
echo "📦 Installation des dépendances..."
composer install --no-dev --optimize-autoloader --no-interaction

# 2. Migration de la base de données
echo "🗄️  Migration de la base de données..."
php artisan migrate --force --no-interaction

# 3. Optimisation Laravel (appel du build.sh)
echo "⚡ Optimisation de l'application..."
bash build.sh

# 4. Nettoyage du cache applicatif
echo "🧹 Nettoyage du cache..."
php artisan cache:clear

# 5. Restart des workers de queue
echo "🔄 Redémarrage des workers..."
php artisan queue:restart

# 6. Vérification de l'état de l'application
echo "🔍 Vérification de l'état de l'application..."
php artisan about

echo ""
echo "✅ Déploiement terminé avec succès !"
echo "================================================================"
echo "📊 Environnement: $ENVIRONMENT"
echo "🕒 Date: $(date '+%Y-%m-%d %H:%M:%S')"
