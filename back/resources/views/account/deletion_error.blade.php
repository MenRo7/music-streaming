// resources/views/account/deletion_error.blade.php
<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Suppression de compte</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui; margin: 40px; max-width: 600px; }
  .error { color: #b91c1c; margin: 20px 0; }
  .btn {
    display: inline-block;
    background: #3b82f6;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    margin-top: 20px;
  }
  .btn:hover { background: #2563eb; }
</style>
</head><body>
  <h1>Suppression de compte</h1>
  <p class="error">{{ $message ?? 'Une erreur est survenue.' }}</p>
  <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/auth" class="btn">
    Retour à la page de connexion
  </a>
</body></html>
