import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiFetch from '../../utils/api';

function SetPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Définir votre mot de passe</h1>
      <p>Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="Mot de passe temporaire actuel" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="submit">Valider</button>
      </form>
    </div>
  );
}

export default SetPassword;