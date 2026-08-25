import { useState, type SubmitEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiFetch from '../../utils/api';

function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await apiFetch('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Mon profil</h1>
      <p>Nom : {user?.name}</p>
      <p>Email : {user?.email}</p>
      <p>Rôle : {user?.role}</p>
      <p>CP restants : {user?.cpBalance} — RTT restants : {user?.rttBalance}</p>

      <h2>Changer mon mot de passe</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="Mot de passe actuel" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="submit">Modifier</button>
      </form>
    </div>
  );
}

export default Profile;