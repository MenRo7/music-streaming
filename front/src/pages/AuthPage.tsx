import React, { useState } from 'react';
import '../styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegistering && password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{isRegistering ? 'Créer un compte' : 'Se connecter'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isRegistering && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit">{isRegistering ? 'S\'inscrire' : 'Se connecter'}</button>
        </form>
        <p>
          {isRegistering ? (
            <>
              Vous avez déjà un compte ?{' '}
              <span className="toggle-link" onClick={() => setIsRegistering(false)}>
                Se connecter
              </span>
            </>
          ) : (
            <>
              Vous n'avez pas de compte ?{' '}
              <span className="toggle-link" onClick={() => setIsRegistering(true)}>
                S'inscrire
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
