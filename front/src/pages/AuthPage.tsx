import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../apis/AuthContext';
import { registerUser } from '../apis/AuthService';

import '../styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/main');
  }, [token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      if (isRegistering) {
        await registerUser(username, email, password);
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError('Erreur lors de l\'authentification. Vérifiez vos informations.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{isRegistering ? 'Créer un compte' : 'Se connecter'}</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit">{isRegistering ? "S'inscrire" : "Se connecter"}</button>
        </form>

        <p>
          {isRegistering ? (
            <>Vous avez déjà un compte ? <span className="toggle-link" onClick={() => setIsRegistering(false)}>Se connecter</span></>
          ) : (
            <>Vous n'avez pas de compte ? <span className="toggle-link" onClick={() => setIsRegistering(true)}>S'inscrire</span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
