import { useState, type SubmitEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiFetch from '../../utils/api';

function Profile() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await apiFetch('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await refreshUser();
      setIsError(false);
      setMessage('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setIsError(true);
      setMessage((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nom</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rôle</span>
            <span className="font-medium text-gray-900">{user?.role}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Département</span>
            <span className="font-medium text-gray-900">{user?.department?.name}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex gap-4">
            <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-gray-500">CP restants</p>
              <p className="text-xl font-bold text-emerald-600">{user?.cpBalance}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-gray-500">RTT restants</p>
              <p className="text-xl font-bold text-emerald-600">{user?.rttBalance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Changer mon mot de passe</h2>
          {message && (
            <p className={`text-sm mb-4 ${isError ? 'text-red-600' : 'text-emerald-600'}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg hover:bg-emerald-700"
            >
              Modifier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
