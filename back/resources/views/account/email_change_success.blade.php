<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changement d'adresse e-mail réussi</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #121212;
      color: #f3f0ff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e1e1e;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      max-width: 400px;
      width: 90%;
    }
    h1 { color: #7c3aed; }
    p { margin-top: 20px; line-height: 1.6; }
    .btn {
      margin-top: 30px;
      display: inline-block;
      background: #7c3aed;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
    }
    .btn:hover { background: #5e2d91; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ Succès !</h1>
    <p>Votre adresse e-mail a été mise à jour avec succès.</p>
    <p><strong>Nouvelle adresse :</strong><br>{{ $email }}</p>
    <a href="/" class="btn">Retourner à l'application</a>
  </div>
</body>
</html>
