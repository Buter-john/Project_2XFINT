import { useState, useEffect, type SubmitEvent } from "react";
import apiFetch from "../../utils/api";

interface User {

  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  departmentId: number;
  department: { name: string };
  managerId: string | null;
  manager : { name: string } | null ;

}

interface Department {
  id: number;
  name: string;
}

function Admin() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setloading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYE');
  const [departmentId, setDepartmentId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  function loadUsers() {
    apiFetch('/users')
      .then((data) => setUsers(data))
      .finally(() => setloading(false));
  }

  function loadDepartments() {
    apiFetch('/departments').then((data) => {
      setDepartments(data);
      if (data.length > 0) setDepartmentId(String(data[0].id));
    });
  }

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  async function handleCreateDepartment(e: SubmitEvent) {
    e.preventDefault();
    await apiFetch('/departments', {
      method: 'POST',
      body: JSON.stringify({ name: newDeptName }),
    });
    setNewDeptName('');
    loadDepartments();
  }

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();

    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!email.endsWith('@supherman.com')) {
      alert('L\'email doit être une adresse @supherman.com');
      return;
    }

    await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, departmentId: Number(departmentId) }),
    })
    setName('');
    setEmail('');
    setPassword('');
    loadUsers();
  }

  async function handleUpdateUser(userId: string, data: Record<string, unknown>) {
    await apiFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    loadUsers();
  }

  async function handleAssignManager(userId: string, managerId: string) {
    await handleUpdateUser(userId, { managerId: managerId || null });
  }

  async function handleResetPassword(id: string) {
    const data = await apiFetch(`/users/${id}/reset-password`, { method: 'POST' });
    alert(`Nouveau mot de passe temporaire : ${data.tempPassword}`);
    loadUsers();
  }

  async function handleToggle(id: string) {
    await apiFetch(`/users/${id}/toggle-active`, {
      method: 'PATCH',
    });
    loadUsers();
  }

  if (loading) return <p className="p-8 text-gray-500">Chargement...</p>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des utilisateurs</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Nouvel utilisateur</h2>
            <div className="space-y-3">
              <input
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="EMPLOYE">Employé</option>
                <option value="MANAGER">Manager</option>
                <option value="RH">RH</option>
              </select>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg hover:bg-emerald-700"
              >
                Créer
              </button>
            </div>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Départements</h2>
            <form onSubmit={handleCreateDepartment} className="flex gap-2 mb-4">
              <input
                placeholder="Nom du département"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-gray-100 text-gray-700 px-3 rounded-lg text-sm hover:bg-gray-200"
              >
                Ajouter
              </button>
            </form>
            <ul className="space-y-1">
              {departments.map((d) => (
                <li key={d.id} className="text-sm text-gray-600 px-2 py-1 rounded bg-gray-50">{d.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <input
                  defaultValue={u.name}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== u.name) {
                      handleUpdateUser(u.id, { name: e.target.value });
                    }
                  }}
                  className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <span>{u.email} ·</span>
                  <select
                    value={u.departmentId}
                    onChange={(e) => handleUpdateUser(u.id, { departmentId: Number(e.target.value) })}
                    className="text-sm text-gray-500 bg-transparent focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <span>·</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                    className="text-sm text-gray-500 bg-transparent focus:outline-none"
                  >
                    <option value="EMPLOYE">Employé</option>
                    <option value="MANAGER">Manager</option>
                    <option value="RH">RH</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {u.role !== 'RH' && (
                  <select
                    value={u.managerId ?? ''}
                    onChange={(e) => handleAssignManager(u.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Aucun manager</option>
                    {users
                      .filter((m) => m.role === 'MANAGER' && m.id !== u.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {u.isActive ? 'Actif' : 'Inactif'}
                </span>
                <button
                  onClick={() => handleResetPassword(u.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Réinitialiser mdp
                </button>
                <button
                  onClick={() => handleToggle(u.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  {u.isActive ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}

export default Admin; 