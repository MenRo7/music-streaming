import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../apis/api";
import "../styles/EditProfileModal.css";

interface EditProfileModalProps {
  isOpen: boolean;
  closeModal: () => void;
  user: any;
  onProfileUpdate: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  closeModal,
  user,
  onProfileUpdate,
}) => {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(`${API_URL}/user/update`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onProfileUpdate(response.data.user);
      closeModal();
    } catch (error) {
      setError("Erreur lors de la mise à jour du profil.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Modifier le Profil</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom d'utilisateur</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image de Profil</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={closeModal}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
