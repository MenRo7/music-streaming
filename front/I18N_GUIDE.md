# Guide d'Internationalisation (i18n)

## 📋 Vue d'ensemble

L'application utilise **i18next** et **react-i18next** pour gérer les traductions.

### Langues supportées

- 🇫🇷 Français (fr) - Langue par défaut
- 🇬🇧 Anglais (en)
- 🇪🇸 Espagnol (es)
- 🇩🇪 Allemand (de)
- 🇮🇹 Italien (it)
- 🇵🇹 Portugais (pt)
- 🇨🇳 Chinois (zh)
- 🇯🇵 Japonais (ja)

## 🔧 Configuration

La configuration i18n se trouve dans `src/i18n/config.ts` :

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
```

### Détection automatique de la langue

L'ordre de détection est :
1. **localStorage** (`i18nextLng`)
2. **Navigateur** (langue du navigateur)
3. **Tag HTML** (`<html lang="...">`)

### Langue de secours

Si une traduction manque, le système utilise le **français** (fallbackLng: 'fr').

## 📁 Structure des fichiers de traduction

Les fichiers de traduction sont dans `src/i18n/locales/` :

```
src/i18n/locales/
├── fr.json  (référence)
├── en.json
├── es.json
├── de.json
├── it.json
├── pt.json
├── zh.json
└── ja.json
```

### Structure JSON

```json
{
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer"
  },
  "auth": {
    "login": "Connexion",
    "email": "Adresse e-mail"
  }
}
```

## 💻 Utilisation dans les composants

### 1. Importer le hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Utiliser dans un composant

```typescript
const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### 3. Avec des variables

```json
{
  "welcome": "Bonjour, {{name}} !"
}
```

```typescript
<h1>{t('welcome', { name: user.name })}</h1>
```

### 4. Pluralisation

```json
{
  "songs": "{{count}} chanson",
  "songs_plural": "{{count}} chansons"
}
```

```typescript
<p>{t('songs', { count: 5 })}</p>  // "5 chansons"
<p>{t('songs', { count: 1 })}</p>  // "1 chanson"
```

## 🔄 Changer de langue

### Dans un composant

```typescript
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};
```

### Langue actuelle

```typescript
const { i18n } = useTranslation();
console.log(i18n.language);  // "fr", "en", etc.
```

## ✅ Bonnes pratiques

### 1. Toujours utiliser des clés descriptives

```typescript
// ❌ Mauvais
t('btn1')
t('txt')

// ✅ Bon
t('common.save')
t('auth.login')
```

### 2. Organiser par domaine fonctionnel

```json
{
  "auth": { ... },
  "profile": { ... },
  "playlist": { ... },
  "music": { ... }
}
```

### 3. Utiliser `common` pour les textes réutilisables

```json
{
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "error": "Erreur",
    "success": "Succès"
  }
}
```

### 4. Ne jamais hardcoder du texte

```typescript
// ❌ Mauvais
<button>Enregistrer</button>

// ✅ Bon
<button>{t('common.save')}</button>
```

### 5. Tester avec différentes langues

```bash
# Changer la langue dans le navigateur
localStorage.setItem('i18nextLng', 'en');
location.reload();
```

## 🧪 Vérifier les traductions manquantes

### Script pour trouver les textes hardcodés

```bash
# Rechercher du texte français hardcodé
cd front/src
grep -r "Chargement\|Enregistrer\|Annuler" --include="*.tsx"
```

### Vérifier qu'une clé existe dans toutes les langues

```bash
# Exemple: vérifier "common.loading"
for lang in fr en es de it pt zh ja; do
  echo "=== $lang ==="
  cat src/i18n/locales/$lang.json | grep -A 1 '"loading"'
done
```

## 📝 Checklist d'internationalisation

Pour chaque nouveau composant :

- [ ] Importer `useTranslation` de 'react-i18next'
- [ ] Extraire `const { t } = useTranslation()`
- [ ] Remplacer TOUS les textes hardcodés par `t('key')`
- [ ] Ajouter les clés dans `fr.json` (fichier de référence)
- [ ] Traduire dans tous les fichiers de langue (en, es, de, it, pt, zh, ja)
- [ ] Tester en changeant de langue dans PreferencesPage

## 🔍 Exemples concrets

### Exemple 1: CookieConsent

```typescript
// Avant
<h2>Gestion des Cookies</h2>
<button>Tout accepter</button>

// Après
const { t } = useTranslation();
<h2>{t('cookies.title')}</h2>
<button>{t('cookies.acceptAll')}</button>
```

### Exemple 2: AuthPage

```typescript
// Avant
<button type="submit">Se connecter</button>
<a href="/forgot">Mot de passe oublié ?</a>

// Après
const { t } = useTranslation();
<button type="submit">{t('auth.login')}</button>
<a href="/forgot">{t('auth.forgotPassword')}</a>
```

### Exemple 3: Messages avec variables

```json
{
  "profile": {
    "followersCount": "{{count}} abonné",
    "followersCount_plural": "{{count}} abonnés"
  }
}
```

```typescript
<p>{t('profile.followersCount', { count: user.followers })}</p>
```

## 🚀 Déploiement

### Variables d'environnement

Aucune variable d'environnement nécessaire pour i18n.

### Build production

```bash
npm run build
# Les fichiers JSON sont inclus automatiquement
```

## 🐛 Dépannage

### Problème: Traduction ne s'affiche pas

**Solution 1**: Vérifier que la clé existe dans le fichier JSON
```typescript
console.log(t('ma.cle', { defaultValue: 'Texte par défaut' }));
```

**Solution 2**: Vérifier que i18n est initialisé
```typescript
import { useTranslation } from 'react-i18next';
const { t, ready } = useTranslation();
if (!ready) return <div>Loading translations...</div>;
```

**Solution 3**: Recharger la page après changement de langue
```typescript
i18n.changeLanguage('en').then(() => {
  window.location.reload();
});
```

### Problème: Langue ne change pas

Vérifier le localStorage :
```javascript
localStorage.getItem('i18nextLng');  // Devrait retourner "fr", "en", etc.
```

Forcer le changement :
```javascript
localStorage.setItem('i18nextLng', 'en');
window.location.reload();
```

## 📚 Ressources

- [Documentation i18next](https://www.i18next.com/)
- [Documentation react-i18next](https://react.i18next.com/)
- [Guide de pluralisation](https://www.i18next.com/translation-function/plurals)
- [Interpolation](https://www.i18next.com/translation-function/interpolation)

## 🎯 Objectif

**100% des textes de l'interface doivent être traduisibles.**

Aucun texte ne doit être hardcodé en français dans le code source.

---

**Status actuel** : 🟡 En cours
**Prochaines étapes** :
1. Compléter tous les fichiers de traduction
2. Internationaliser tous les composants
3. Tester toutes les langues
4. Documenter les nouvelles clés ajoutées
