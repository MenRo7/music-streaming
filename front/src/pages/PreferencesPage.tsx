import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getPreferences,
  getStripeStatus,
  startStripeOnboarding,
  setLocale as setLocalePref,
} from '../apis/PreferencesService';
import { fetchUser, requestAccountDeletion } from '../apis/UserService';
import PersonalInfoModal from '../components/PersonalInfoModal';

import '../styles/PreferencesPage.css';

type StripeStatus = {
  has_connect: boolean;
  account_id?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  currently_due: string[];
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  profile_image?: string | null;
  updated_at?: string | null;
  date_of_birth?: string | null;
};

const PreferencesPage: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [locale, setLocaleState] = useState<'fr' | 'en'>('fr');

  const [connectId, setConnectId] = useState<string | null>(null);
  const [stripe, setStripe] = useState<StripeStatus>({
    has_connect: false,
    charges_enabled: false,
    payouts_enabled: false,
    currently_due: [],
  });

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [showPersonalModal, setShowPersonalModal] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const onboardingState = params.get('onboarding');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const prefs = await getPreferences();
        if (prefs?.locale) setLocaleState(prefs.locale);
        if (prefs?.stripe_connect_id) setConnectId(prefs.stripe_connect_id);

        const st = await getStripeStatus();
        setStripe(st);

        const ures = await fetchUser();
        setUser(ures.data);
      } catch (e) {
        console.error('Erreur chargement préférences', e);
        alert("Impossible de charger vos préférences.");
      } finally {
        setLoading(false);
      }
    })();
  }, [location.key]);

  const onSaveLocale = async () => {
    try {
      await setLocalePref(locale);
      alert('Langue enregistrée ✅');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde de la langue.');
    }
  };

  const onStartOnboarding = async () => {
    try {
      const { onboarding_url } = await startStripeOnboarding();
      window.location.href = onboarding_url;
    } catch (e) {
      console.error(e);
      alert("Impossible de démarrer l'onboarding Stripe.");
    }
  };

  const needsAction = useMemo(() => {
    return (
      !stripe.has_connect ||
      (stripe.currently_due && stripe.currently_due.length > 0) ||
      !stripe.charges_enabled ||
      !stripe.payouts_enabled
    );
  }, [stripe]);

  const onRequestDeletion = async () => {
    const ok = window.confirm(
      "Cette action est irréversible.\n\n" +
      "Nous allons vous envoyer un e-mail pour confirmer la suppression de votre compte " +
      "et de toutes les données associées (playlists, musiques, albums, likes, abonnements, fichiers…).\n\n" +
      "Voulez-vous continuer ?"
    );
    if (!ok) return;

    try {
      await requestAccountDeletion();
      alert('E-mail de confirmation envoyé. Vérifiez votre boîte mail 📬');
    } catch (e) {
      console.error(e);
      alert("Impossible d'envoyer l’e-mail de confirmation.");
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-content">
        <h1>Préférences</h1>

        {onboardingState === 'success' && (
          <div className="pref-banner success" role="status">
            Compte Stripe mis à jour. Merci !
          </div>
        )}
        {onboardingState === 'refresh' && (
          <div className="pref-banner warn" role="status">
            Onboarding interrompu. Vous pouvez reprendre quand vous voulez.
          </div>
        )}

        {loading ? (
          <div className="card"><p>Chargement…</p></div>
        ) : (
          <>
            <div className="card">
              <h2>Informations personnelles</h2>
              <div className="grid">
                <div>
                  <div className="label">E-mail actuel</div>
                  <div className="value">{user?.email || '—'}</div>
                </div>
                <div>
                  <div className="label">Date de naissance</div>
                  <div className="value">{user?.date_of_birth || '—'}</div>
                </div>
              </div>
              <div className="row mt">
                <button className="btn info-edit" onClick={() => setShowPersonalModal(true)}>
                  Modifier mes informations
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Langue</h2>
              <div className="row">
                <select
                  value={locale}
                  onChange={(e) => setLocaleState(e.target.value as 'fr' | 'en')}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
                <button className="btn primary" onClick={onSaveLocale}>Enregistrer</button>
              </div>
            </div>

            <div className="card">
              <h2>Paiements (Stripe Connect)</h2>

              <div className="grid">
                <div>
                  <div className="label">Compte connecté</div>
                  <div className="value">
                    {stripe.has_connect ? (stripe.account_id || connectId) : 'Aucun'}
                  </div>
                </div>
                <div>
                  <div className="label">Encaissements (charges)</div>
                  <div className={`pill ${stripe.charges_enabled ? 'ok' : 'ko'}`}>
                    {stripe.charges_enabled ? 'Activés' : 'À compléter'}
                  </div>
                </div>
                <div>
                  <div className="label">Virements (payouts)</div>
                  <div className={`pill ${stripe.payouts_enabled ? 'ok' : 'ko'}`}>
                    {stripe.payouts_enabled ? 'Activés' : 'À compléter'}
                  </div>
                </div>
              </div>

              {stripe.currently_due?.length > 0 && (
                <div className="due-box">
                  <div className="label">Informations requises :</div>
                  <ul>
                    {stripe.currently_due.map((k) => <li key={k}>{k}</li>)}
                  </ul>
                </div>
              )}

              <div className="row mt">
                <button className="btn primary" onClick={onStartOnboarding}>
                  {needsAction ? 'Activer/Compléter mes paiements' : 'Mettre à jour mes informations'}
                </button>
              </div>

              <p className="hint">
                Astuce : si Stripe demande une vérification (2FA), ouvrez la page en navigation privée
                et utilisez l’adresse e-mail associée à votre compte connecté.
              </p>
            </div>

            <div className="card" style={{ borderColor: '#ef4444' }}>
              <h2>Supprimer mon compte</h2>
              <p className="hint">
                Cette opération est <strong>définitive</strong> et supprimera toutes vos données
                (profil, musiques, albums, playlists, likes, abonnements, fichiers…).
                Un e-mail de confirmation vous sera envoyé. La suppression ne sera effectuée
                qu’après votre clic sur le lien de confirmation.
              </p>
              <div className="row mt">
                <button
                  className="btn"
                  style={{ background: '#ef4444', color: '#fff' }}
                  onClick={onRequestDeletion}
                >
                  Supprimer mon compte…
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {user && (
        <PersonalInfoModal
          isOpen={showPersonalModal}
          onClose={() => setShowPersonalModal(false)}
          user={user}
          onProfileUpdate={(u) => setUser(u)}
        />
      )}
    </div>
  );
};

export default PreferencesPage;
