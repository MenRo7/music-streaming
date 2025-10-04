import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  requestEmailChange,
  changePassword,
  updateUserProfile,
} from "../apis/UserService";
import "./../styles/PersonalInfoModal.css";

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
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [pwdForEmail, setPwdForEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dob, setDob] = useState(user?.date_of_birth || "");

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setInfo(null);
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
    const y = t.getFullYear() - 18;
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      if (!newEmail.trim() || !pwdForEmail.trim()) {
        setError("Renseignez le nouvel e-mail et votre mot de passe actuel.");
        return;
      }
      await requestEmailChange(newEmail.trim(), pwdForEmail);
      setInfo(
        "Demande envoyée ✅. Vérifiez votre nouvelle adresse pour confirmer le changement."
      );
      setNewEmail("");
      setPwdForEmail("");
    } catch (err) {
      console.error(err);
      setError("Impossible de demander le changement d’e-mail.");
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      if (!currentPassword.trim() || !newPassword.trim()) {
        setError("Renseignez le mot de passe actuel et le nouveau mot de passe.");
        return;
      }
      await changePassword(currentPassword, newPassword);
      setInfo("Mot de passe mis à jour ✅. Veuillez vous reconnecter.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setError("Impossible de mettre à jour le mot de passe.");
    }
  };

  const handleSubmitDob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      if (!dob.trim()) {
        setError("Sélectionnez une date de naissance.");
        return;
      }
      const today = new Date();
      const [y, m, d] = dob.split("-").map(Number);
      const dobDate = new Date(y, (m || 1) - 1, d || 1);
      const eighteen = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      if (dobDate > eighteen) {
        setError("Vous devez avoir au moins 18 ans.");
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
    } catch (err) {
      console.error(err);
      setError("Impossible de mettre à jour la date de naissance.");
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="pi-modal-overlay" onClick={onClose}>
      <div className="pi-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Informations personnelles</h2>

        {error && <div className="pi-error">{error}</div>}
        {info && <div className="pi-info">{info}</div>}

        <form className="pi-card" onSubmit={handleSubmitEmail}>
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
            />
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
            />
          </div>
          <div className="pi-actions">
            <button type="submit">Demander le changement</button>
          </div>
          <p className="pi-hint">
            Un e-mail de confirmation sera envoyé à la nouvelle adresse.
          </p>
        </form>

        <form className="pi-card" onSubmit={handleSubmitPassword}>
          <h3>Changer de mot de passe</h3>
          <div className="pi-form-group">
            <label htmlFor="pi-current-pwd">Mot de passe actuel</label>
            <input
              id="pi-current-pwd"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="pi-form-group">
            <label htmlFor="pi-new-pwd">Nouveau mot de passe</label>
            <input
              id="pi-new-pwd"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="pi-actions">
            <button type="submit">Enregistrer le nouveau mot de passe</button>
          </div>
        </form>

        <form className="pi-card" onSubmit={handleSubmitDob}>
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
            />
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
