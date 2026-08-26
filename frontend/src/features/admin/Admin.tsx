import { useState, useEffect, type SubmitEvent } from "react";
import apiFetch from "../../utils/api";

interface User {

  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department: { name: string };

}

function Admin() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setloading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYE');
  const [departmentId, setDepartmentId] = useState('1');

  function loadUsers() {
    apiFetch('/users')
      .then((data) => setUsers(data))
      .finally(() => setloading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, departmentId: Number(departmentId) }),
    })
    setName('');
    setEmail('');
    setPassword('');
    loadUsers();
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

  if (loading) return <p>Chargement....</p>

  return (
    <div>
      <h1>Gestion des utilisateurs</h1>

      <form onSubmit={handleCreate}>
        <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="EMPLOYE">Employé</option>
          <option value="MANAGER">Manager</option>
          <option value="RH">RH</option>
        </select>
        <input type="number" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
        <button type="submit">Créer</button>
      </form>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email} — {u.role} — {u.department.name} — {u.isActive ? 'Actif' : 'Inactif'}
            {' '}
            <button onClick={() => handleToggle(u.id)}>
              {u.isActive ? 'Désactiver' : 'Réactiver'}
            </button>
            <button onClick={() => handleResetPassword(u.id)}>Réinitialiser mot de passe</button>
          </li>
        ))}
      </ul>
    </div>
  );

}

export default Admin; 