import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  requestEmailChange,
  changePassword,
  updateUserProfile,
} from "../apis/UserService";
import "./../styles/PersonalInfoModal.css";

/** Types utilitaires */
type LaravelFieldErrors = Record<string, string[]>;

function extractLaravelError(e: any): { message?: string; errors?: LaravelFieldErrors } {
  const data = e?.response?.data ?? e?.data ?? e;
  return {
    message: data?.message,
    errors: data?.errors,
  };
}

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    date_of_birth?: string | null;
  };
  onProfileUpdate: (updatedUser: any) => void;
}

const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}) => {
  // Messages globaux (bannière en haut du modal)
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Champs
  const [newEmail, setNewEmail] = useState("");
  const [pwdForEmail, setPwdForEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dob, setDob] = useState(user?.date_of_birth || "");

  // Erreurs par champ (affichage sous chaque input)
  const [fieldErrors, setFieldErrors] = useState<{
    newEmail?: string;
    pwdForEmail?: string;
    currentPassword?: string;
    newPassword?: string;
    dob?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    // reset à l’ouverture
    setError(null);
    setInfo(null);
    setFieldErrors({});
    setNewEmail("");
    setPwdForEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setDob(user?.date_of_birth || "");

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, user, onClose]);

  const maxDob = useMemo(() => {
    const t = new Date();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${t.getFullYear()}-${m}-${d}`;
  }, []);

  // (Facultatif) Validation côté client – n’empêche pas la validation back,
  // mais améliore l’UX en évitant un round-trip inutile si évident
  const pwMeetsPolicy = (pw: string) =>
    pw.length >= 12 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[@$!%*#?&]/.test(pw);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({}); // reset

    try {
      if (!newEmail.trim() || !pwdForEmail.trim()) {
        setError("Renseignez le nouvel e-mail et votre mot de passe actuel.");
        return;
      }

      await requestEmailChange(newEmail.trim(), pwdForEmail);

      setInfo("Demande envoyée ✅. Vérifiez votre nouvelle adresse pour confirmer le changement.");
      setNewEmail("");
      setPwdForEmail("");
    } catch (err: any) {
      console.error(err);
      const { message, errors } = extractLaravelError(err);

      const fe: typeof fieldErrors = {};
      if (errors?.new_email?.length) fe.newEmail = errors.new_email.join(" ");
      if (errors?.current_password?.length) fe.pwdForEmail = errors.current_password.join(" ");
      setFieldErrors(fe);

      setError(fe.newEmail || fe.pwdForEmail || message || "Impossible de demander le changement d’e-mail.");
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({}); // reset

    try {
      if (!currentPassword.trim() || !newPassword.trim()) {
        setError("Renseignez le mot de passe actuel et le nouveau mot de passe.");
        return;
      }

      // Optionnel : prévalider pour feedback immédiat
      if (!pwMeetsPolicy(newPassword)) {
        setFieldErrors({
          newPassword:
            "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*#?&).",
        });
        return;
      }

      await changePassword(currentPassword, newPassword);

      setInfo("Mot de passe mis à jour ✅. Veuillez vous reconnecter.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      const { message, errors } = extractLaravelError(err);

      const fe: typeof fieldErrors = {};
      if (errors?.current_password?.length) fe.currentPassword = errors.current_password.join(" ");
      if (errors?.new_password?.length) fe.newPassword = errors.new_password.join(" ");
      setFieldErrors(fe);

      setError(fe.currentPassword || fe.newPassword || message || "Impossible de mettre à jour le mot de passe.");
    }
  };

  const handleSubmitDob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({}); // reset

    try {
      if (!dob.trim()) {
        setFieldErrors({ dob: "Sélectionnez une date de naissance." });
        return;
      }

      const fd = new FormData();
      fd.append("name", user.name);
      fd.append("date_of_birth", dob);

      const res = await updateUserProfile(fd);
      if (res?.data?.user) {
        onProfileUpdate(res.data.user);
        setInfo("Date de naissance mise à jour ✅");
      }
    } catch (err: any) {
      console.error(err);
      const { message, errors } = extractLaravelError(err);

      const fe: typeof fieldErrors = {};
      if (errors?.date_of_birth?.length) fe.dob = errors.date_of_birth.join(" ");
      setFieldErrors(fe);

      setError(fe.dob || message || "Impossible de mettre à jour la date de naissance.");
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="pi-modal-overlay" onClick={onClose}>
      <div className="pi-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Informations personnelles</h2>

        {error && <div className="pi-error" role="alert">{error}</div>}
        {info && <div className="pi-info" role="status">{info}</div>}

        {/* Changer d’e-mail */}
        <form className="pi-card" onSubmit={handleSubmitEmail} noValidate>
          <h3>Changer d’e-mail</h3>
          <div className="pi-form-group">
            <label htmlFor="pi-new-email">Nouvel e-mail</label>
            <input
              id="pi-new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nouveau@exemple.com"
              required
              aria-invalid={!!fieldErrors.newEmail}
              aria-describedby={fieldErrors.newEmail ? "err-new-email" : undefined}
            />
            {fieldErrors.newEmail && (
              <div id="err-new-email" className="pi-field-error">{fieldErrors.newEmail}</div>
            )}
          </div>
          <div className="pi-form-group">
            <label htmlFor="pi-email-pwd">Mot de passe actuel</label>
            <input
              id="pi-email-pwd"
              type="password"
              value={pwdForEmail}
              onChange={(e) => setPwdForEmail(e.target.value)}
              placeholder="Mot de passe actuel"
              required
              aria-invalid={!!fieldErrors.pwdForEmail}
              aria-describedby={fieldErrors.pwdForEmail ? "err-pwd-email" : undefined}
            />
            {fieldErrors.pwdForEmail && (
              <div id="err-pwd-email" className="pi-field-error">{fieldErrors.pwdForEmail}</div>
            )}
          </div>
          <div className="pi-actions">
            <button type="submit">Demander le changement</button>
          </div>
          <p className="pi-hint">
            Un e-mail de confirmation sera envoyé à la nouvelle adresse.
          </p>
        </form>

        {/* Changer de mot de passe */}
        <form className="pi-card" onSubmit={handleSubmitPassword} noValidate>
          <h3>Changer de mot de passe</h3>
          <div className="pi-form-group">
            <label htmlFor="pi-current-pwd">Mot de passe actuel</label>
            <input
              id="pi-current-pwd"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              aria-invalid={!!fieldErrors.currentPassword}
              aria-describedby={fieldErrors.currentPassword ? "err-current-pwd" : undefined}
            />
            {fieldErrors.currentPassword && (
              <div id="err-current-pwd" className="pi-field-error">{fieldErrors.currentPassword}</div>
            )}
          </div>
          <div className="pi-form-group">
            <label htmlFor="pi-new-pwd">Nouveau mot de passe</label>
            <input
              id="pi-new-pwd"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              aria-invalid={!!fieldErrors.newPassword}
              aria-describedby={fieldErrors.newPassword ? "err-new-pwd" : "pwd-hint"}
            />
            <div id="pwd-hint" className="pi-hint">
              Au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*#?&).
            </div>
            {fieldErrors.newPassword && (
              <div id="err-new-pwd" className="pi-field-error">{fieldErrors.newPassword}</div>
            )}
          </div>
          <div className="pi-actions">
            <button type="submit">Enregistrer le nouveau mot de passe</button>
          </div>
        </form>

        {/* Mettre à jour la date de naissance */}
        <form className="pi-card" onSubmit={handleSubmitDob} noValidate>
          <h3>Mettre à jour ma date de naissance</h3>
          <div className="pi-form-group">
            <label htmlFor="pi-dob">Date de naissance</label>
            <input
              id="pi-dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={maxDob}
              required
              autoComplete="bday"
              aria-invalid={!!fieldErrors.dob}
              aria-describedby={fieldErrors.dob ? "err-dob" : undefined}
            />
            {fieldErrors.dob && (
              <div id="err-dob" className="pi-field-error">{fieldErrors.dob}</div>
            )}
          </div>
          <div className="pi-actions">
            <button type="submit">Mettre à jour</button>
            <button type="button" className="pi-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
          <p className="pi-hint">
            Les fonctionnalités liées aux paiements sont réservées aux utilisateurs de 18 ans et plus.
          </p>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PersonalInfoModal;
