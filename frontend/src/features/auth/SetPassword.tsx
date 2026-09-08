import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiFetch from '../../utils/api';
import { KeyRound } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-lg w-[30rem] border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <KeyRound className="text-emerald-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Définir votre mot de passe</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe temporaire actuel</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Mot de passe temporaire actuel"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Nouveau mot de passe"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Valider
        </button>
      </form>
    </div>
  );
}

export default SetPassword;