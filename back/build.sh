#!/bin/bash
# Script d'optimisation Laravel pour production
# Exécuté automatiquement lors du déploiement

echo "🚀 Optimisation Laravel - Rhapsody Backend"
echo "=========================================="

# 1. Mise en cache de la configuration
echo "📦 Mise en cache de la configuration..."
php artisan config:cache

# 2. Mise en cache des routes
echo "🛣️  Mise en cache des routes..."
php artisan route:cache

# 3. Précompilation des vues Blade
echo "👁️  Précompilation des vues..."
php artisan view:cache

# 4. Optimisation globale (autoload classmap)
echo "⚡ Optimisation de l'autoloader..."
php artisan optimize

echo ""
echo "✅ Optimisation terminée avec succès !"
echo "=========================================="
