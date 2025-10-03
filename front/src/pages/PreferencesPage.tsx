import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getPreferences,
  getStripeStatus,
  startStripeOnboarding,
  setLocale,
} from '../apis/PreferencesService';
import '../styles/PreferencesPage.css';

type StripeStatus = {
  has_connect: boolean;
  account_id?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  currently_due: string[];
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
      await setLocale(locale);
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
    return !stripe.has_connect || (stripe.currently_due && stripe.currently_due.length > 0)
      || !stripe.charges_enabled || !stripe.payouts_enabled;
  }, [stripe]);

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
          </>
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;
