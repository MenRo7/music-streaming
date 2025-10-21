// resources/views/account/deletion_success.blade.php
<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Compte supprimé</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head><body style="font-family:system-ui;margin:40px">
  <h1>Votre compte a été supprimé</h1>
  <p>Redirection vers la page de connexion…</p>
  <script>
    try {
      localStorage.removeItem('authToken');
    } catch (e) {}
    window.location.href = '/auth';
  </script>
</body></html>
