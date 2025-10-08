import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getPreferences,
  getStripeStatus,
  startStripeOnboarding,
  setLocale as setLocalePref,
} from '../apis/PreferencesService';
import { fetchUser, requestAccountDeletion } from '../apis/UserService';
import { exportUserData, getUserDataSummary } from '../apis/DataExportService';
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
  const [exportingData, setExportingData] = useState(false);
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [dataSummary, setDataSummary] = useState<any>(null);

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
      alert("Impossible d'envoyer l'e-mail de confirmation.");
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      await exportUserData();
      alert('✅ Vos données ont été téléchargées avec succès !');
    } catch (e) {
      console.error(e);
      alert("❌ Erreur lors de l'export de vos données.");
    } finally {
      setExportingData(false);
    }
  };

  const handleViewDataSummary = async () => {
    try {
      const summary = await getUserDataSummary();
      setDataSummary(summary);
      setShowDataSummary(true);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur lors de la récupération du résumé de vos données.");
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

            <div className="card" style={{ borderColor: '#3b82f6' }}>
              <h2>Mes données (RGPD)</h2>
              <p className="hint">
                Conformément au RGPD, vous avez le droit d'accéder à vos données personnelles,
                de les télécharger dans un format structuré (Article 20 - Portabilité) et de
                consulter un résumé de vos informations (Article 15 - Droit d'accès).
              </p>
              <div className="row mt" style={{ gap: '10px' }}>
                <button
                  className="btn"
                  style={{ background: '#3b82f6', color: '#fff' }}
                  onClick={handleExportData}
                  disabled={exportingData}
                >
                  {exportingData ? 'Export en cours...' : '📥 Télécharger mes données (JSON)'}
                </button>
                <button
                  className="btn"
                  style={{ background: '#10b981', color: '#fff' }}
                  onClick={handleViewDataSummary}
                >
                  📊 Voir le résumé de mes données
                </button>
              </div>
            </div>

            {showDataSummary && dataSummary && (
              <div className="card" style={{ borderColor: '#10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Résumé de mes données</h2>
                  <button
                    className="btn"
                    style={{ background: '#6b7280', color: '#fff', padding: '8px 16px' }}
                    onClick={() => setShowDataSummary(false)}
                  >
                    ✕ Fermer
                  </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h3>Informations personnelles</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">Nom</div>
                      <div className="value">{dataSummary.personal_information?.name || '—'}</div>
                    </div>
                    <div>
                      <div className="label">Email</div>
                      <div className="value">{dataSummary.personal_information?.email || '—'}</div>
                    </div>
                    <div>
                      <div className="label">Date de naissance</div>
                      <div className="value">{dataSummary.personal_information?.date_of_birth || '—'}</div>
                    </div>
                    <div>
                      <div className="label">Compte créé le</div>
                      <div className="value">{dataSummary.personal_information?.account_created || '—'}</div>
                    </div>
                  </div>

                  <h3>Statistiques de contenu</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">Musiques téléversées</div>
                      <div className="value">{dataSummary.content_statistics?.uploaded_tracks || 0}</div>
                    </div>
                    <div>
                      <div className="label">Albums créés</div>
                      <div className="value">{dataSummary.content_statistics?.created_albums || 0}</div>
                    </div>
                    <div>
                      <div className="label">Playlists créées</div>
                      <div className="value">{dataSummary.content_statistics?.created_playlists || 0}</div>
                    </div>
                    <div>
                      <div className="label">Favoris</div>
                      <div className="value">{dataSummary.content_statistics?.favorite_tracks || 0}</div>
                    </div>
                  </div>

                  <h3>Social</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">Abonnements</div>
                      <div className="value">{dataSummary.social?.following || 0}</div>
                    </div>
                    <div>
                      <div className="label">Abonnés</div>
                      <div className="value">{dataSummary.social?.followers || 0}</div>
                    </div>
                  </div>

                  <h3>Financier</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">Paiements activés</div>
                      <div className="value">{dataSummary.financial?.payments_enabled || 'Non'}</div>
                    </div>
                    <div>
                      <div className="label">Donations effectuées</div>
                      <div className="value">{dataSummary.financial?.donations_made || 0}</div>
                    </div>
                    <div>
                      <div className="label">Donations reçues</div>
                      <div className="value">{dataSummary.financial?.donations_received || 0}</div>
                    </div>
                  </div>

                  <h3>Vos droits RGPD</h3>
                  <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
                    <li>✅ <strong>Droit d'accès :</strong> {dataSummary.data_rights?.right_to_access}</li>
                    <li>✅ <strong>Droit à la portabilité :</strong> {dataSummary.data_rights?.right_to_export}</li>
                    <li>✅ <strong>Droit de rectification :</strong> {dataSummary.data_rights?.right_to_rectification}</li>
                    <li>✅ <strong>Droit à l'effacement :</strong> {dataSummary.data_rights?.right_to_erasure}</li>
                  </ul>
                </div>
              </div>
            )}

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
