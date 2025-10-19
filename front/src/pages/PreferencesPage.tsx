import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPreferences,
  getStripeStatus,
  startStripeOnboarding,
  setLocale as setLocalePref,
} from '../apis/PreferencesService';
import { fetchUser, requestAccountDeletion } from '../apis/UserService';
import { exportUserData, getUserDataSummary } from '../apis/DataExportService';
import PersonalInfoModal from '../components/PersonalInfoModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { isAdult as checkIsAdult } from '../utils/ageCalculator';

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [locale, setLocaleState] = useState<string>(i18n.language || 'fr');

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

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    variant: 'info' as 'danger' | 'warning' | 'info',
  });

  // Toast state
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  const isAdult = useMemo(() => {
    return checkIsAdult(user?.date_of_birth);
  }, [user?.date_of_birth]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const onboardingState = params.get('onboarding');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'warning' | 'info' = 'info',
    confirmText: string = t('common.confirm'),
    cancelText: string = t('common.cancel')
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      variant,
    });
  };

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
        console.error(t('preferences.errorLoading'), e);
        showToast(t('preferences.errorLoadingPreferences'), 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const onSaveLocale = async () => {
    try {
      // Update i18next language
      await i18n.changeLanguage(locale);

      // Save to backend if locale is 'fr' or 'en' (backend only supports these two)
      if (locale === 'fr' || locale === 'en') {
        await setLocalePref(locale);
      }

      showToast(t('preferences.languageSaved'), 'success');
    } catch (e) {
      console.error(e);
      showToast(t('preferences.errorSavingLanguage'), 'error');
    }
  };

  const onStartOnboarding = async () => {
    try {
      const { onboarding_url } = await startStripeOnboarding();
      window.location.href = onboarding_url;
    } catch (e) {
      console.error(e);
      showToast(t('preferences.errorStartingOnboarding'), 'error');
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

  const onRequestDeletion = () => {
    showConfirm(
      t('preferences.deleteAccountTitle'),
      t('preferences.deleteAccountConfirm').replace(/\\n/g, '\n'),
      async () => {
        try {
          await requestAccountDeletion();
          showToast(t('preferences.deleteAccountEmailSent'), 'success');
        } catch (e) {
          console.error(e);
          showToast(t('preferences.errorSendingDeleteEmail'), 'error');
        }
      },
      'danger',
      t('preferences.deleteAccountButton'),
      t('common.cancel')
    );
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      await exportUserData();
      showToast(t('preferences.dataExported'), 'success');
    } catch (e) {
      console.error(e);
      showToast(t('preferences.errorExportingData'), 'error');
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
      showToast(t('preferences.errorViewingSummary'), 'error');
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-content">
        <h1>{t('preferences.title')}</h1>

        {onboardingState === 'success' && (
          <div className="pref-banner success" role="status">
            {t('preferences.onboardingSuccess')}
          </div>
        )}
        {onboardingState === 'refresh' && (
          <div className="pref-banner warn" role="status">
            {t('preferences.onboardingRefresh')}
          </div>
        )}

        {loading ? (
          <div className="card"><p>{t('preferences.loading')}</p></div>
        ) : (
          <>
            <div className="card">
              <h2>{t('preferences.personalInfo')}</h2>
              <div className="grid">
                <div>
                  <div className="label">{t('preferences.currentEmail')}</div>
                  <div className="value">{user?.email || '—'}</div>
                </div>
                <div>
                  <div className="label">{t('preferences.dateOfBirth')}</div>
                  <div className="value">{user?.date_of_birth || '—'}</div>
                </div>
              </div>
              <div className="row mt">
                <button className="btn info-edit" onClick={() => setShowPersonalModal(true)}>
                  {t('preferences.editInfo')}
                </button>
              </div>
            </div>

            <div className="card">
              <h2>{t('preferences.languageSection')}</h2>
              <p className="hint">
                {t('preferences.languageHint')}
              </p>
              <div className="language-selector">
                <div className="language-options">
                  <button
                    className={`language-option ${locale === 'fr' ? 'selected' : ''}`}
                    onClick={() => setLocaleState('fr')}
                    type="button"
                  >
                    <span className="flag">🇫🇷</span>
                    <span className="language-name">Français</span>
                  </button>
                  <button
                    className={`language-option ${locale === 'en' ? 'selected' : ''}`}
                    onClick={() => setLocaleState('en')}
                    type="button"
                  >
                    <span className="flag">🇬🇧</span>
                    <span className="language-name">English</span>
                  </button>
                </div>
                <button className="btn primary" onClick={onSaveLocale}>{t('preferences.saveLanguage')}</button>
              </div>
            </div>

            {isAdult ? (
              <div className="card">
                <h2>{t('preferences.paymentsStripe')}</h2>

                <div className="grid">
                  <div>
                    <div className="label">{t('preferences.connectedAccount')}</div>
                    <div className="value">
                      {stripe.has_connect ? (stripe.account_id || connectId) : t('preferences.none')}
                    </div>
                  </div>
                  <div>
                    <div className="label">{t('preferences.charges')}</div>
                    <div className={`pill ${stripe.charges_enabled ? 'ok' : 'ko'}`}>
                      {stripe.charges_enabled ? t('preferences.enabled') : t('preferences.toComplete')}
                    </div>
                  </div>
                  <div>
                    <div className="label">{t('preferences.payouts')}</div>
                    <div className={`pill ${stripe.payouts_enabled ? 'ok' : 'ko'}`}>
                      {stripe.payouts_enabled ? t('preferences.enabled') : t('preferences.toComplete')}
                    </div>
                  </div>
                </div>

                {stripe.currently_due?.length > 0 && (
                  <div className="due-box">
                    <div className="label">{t('preferences.requiredInfo')}</div>
                    <ul>
                      {stripe.currently_due.map((k) => <li key={k}>{k}</li>)}
                    </ul>
                  </div>
                )}

                <div className="row mt">
                  <button className="btn primary" onClick={onStartOnboarding}>
                    {needsAction ? t('preferences.activatePayments') : t('preferences.updateInfo')}
                  </button>
                </div>

                <p className="hint">
                  {t('preferences.stripeHint')}
                </p>
              </div>
            ) : (
              <div className="card">
                <h2>{t('preferences.payments18Plus')}</h2>
                <p className="hint">
                  {t('preferences.payments18PlusHint')}
                </p>
                <p className="hint" style={{ marginTop: '12px' }}>
                  {t('preferences.payments18PlusHint2')}
                </p>
              </div>
            )}

            <div className="card" style={{ borderColor: '#3b82f6' }}>
              <h2>{t('preferences.myDataGDPR')}</h2>
              <p className="hint">
                {t('preferences.gdprHint')}
              </p>
              <div className="row mt" style={{ gap: '10px' }}>
                <button
                  className="btn"
                  style={{ background: '#3b82f6', color: '#fff' }}
                  onClick={handleExportData}
                  disabled={exportingData}
                >
                  {exportingData ? t('preferences.downloadingData') : t('preferences.downloadData')}
                </button>
                <button
                  className="btn"
                  style={{ background: '#10b981', color: '#fff' }}
                  onClick={handleViewDataSummary}
                >
                  {t('preferences.viewDataSummary')}
                </button>
              </div>
            </div>

            <div className="card" style={{ borderColor: '#8b5cf6' }}>
              <h2>{t('preferences.cookieManagement')}</h2>
              <p className="hint">
                {t('preferences.cookieHint')}
              </p>
              <div className="row mt">
                <button
                  className="btn"
                  style={{ background: '#8b5cf6', color: '#fff' }}
                  onClick={() => {
                    localStorage.removeItem('cookieConsent');
                    window.location.reload();
                  }}
                >
                  {t('preferences.modifyCookies')}
                </button>
              </div>
            </div>

            {showDataSummary && dataSummary && (
              <div className="card" style={{ borderColor: '#10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>{t('preferences.dataSummaryTitle')}</h2>
                  <button
                    className="btn"
                    style={{ background: '#6b7280', color: '#fff', padding: '8px 16px' }}
                    onClick={() => setShowDataSummary(false)}
                  >
                    {t('preferences.closeSummary')}
                  </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h3>{t('preferences.personalInformation')}</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">{t('preferences.name')}</div>
                      <div className="value">{dataSummary.personal_information?.name || '—'}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.email')}</div>
                      <div className="value">{dataSummary.personal_information?.email || '—'}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.dateOfBirthLabel')}</div>
                      <div className="value">{dataSummary.personal_information?.date_of_birth || '—'}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.accountCreated')}</div>
                      <div className="value">{dataSummary.personal_information?.account_created || '—'}</div>
                    </div>
                  </div>

                  <h3>{t('preferences.contentStatistics')}</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">{t('preferences.uploadedTracks')}</div>
                      <div className="value">{dataSummary.content_statistics?.uploaded_tracks || 0}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.createdAlbums')}</div>
                      <div className="value">{dataSummary.content_statistics?.created_albums || 0}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.createdPlaylists')}</div>
                      <div className="value">{dataSummary.content_statistics?.created_playlists || 0}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.favoriteTracks')}</div>
                      <div className="value">{dataSummary.content_statistics?.favorite_tracks || 0}</div>
                    </div>
                  </div>

                  <h3>{t('preferences.social')}</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">{t('preferences.following')}</div>
                      <div className="value">{dataSummary.social?.following || 0}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.followers')}</div>
                      <div className="value">{dataSummary.social?.followers || 0}</div>
                    </div>
                  </div>

                  <h3>{t('preferences.financial')}</h3>
                  <div className="grid" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="label">{t('preferences.paymentsEnabled')}</div>
                      <div className="value">{dataSummary.financial?.payments_enabled || t('preferences.paymentsNo')}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.donationsMade')}</div>
                      <div className="value">{dataSummary.financial?.donations_made || 0}</div>
                    </div>
                    <div>
                      <div className="label">{t('preferences.donationsReceived')}</div>
                      <div className="value">{dataSummary.financial?.donations_received || 0}</div>
                    </div>
                  </div>

                  <h3>{t('preferences.gdprRights')}</h3>
                  <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
                    <li>✅ <strong>{t('preferences.rightToAccess')} :</strong> {dataSummary.data_rights?.right_to_access}</li>
                    <li>✅ <strong>{t('preferences.rightToExport')} :</strong> {dataSummary.data_rights?.right_to_export}</li>
                    <li>✅ <strong>{t('preferences.rightToRectification')} :</strong> {dataSummary.data_rights?.right_to_rectification}</li>
                    <li>✅ <strong>{t('preferences.rightToErasure')} :</strong> {dataSummary.data_rights?.right_to_erasure}</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="card" style={{ borderColor: '#ef4444' }}>
              <h2>{t('preferences.deleteAccountTitle')}</h2>
              <p className="hint">
                {t('preferences.deleteAccountHint')}
              </p>
              <div className="row mt">
                <button
                  className="btn"
                  style={{ background: '#ef4444', color: '#fff' }}
                  onClick={onRequestDeletion}
                >
                  {t('preferences.deleteAccountButton')}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        variant={confirmDialog.variant}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PreferencesPage;
