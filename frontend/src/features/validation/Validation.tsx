import { useState, useEffect } from "react";
import apiFetch from "../../utils/api";


interface LeaveRequest {

  id: string;
  type: string;
  startDate: string;
  endDate: string;
  workingDays: string;
  status: string;
  comment: string | null;
  user: { name: string; email: string };
}


function validation() {

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');


  function loadingPending() {

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);

    apiFetch(`/requests/pending?${params.toString()}`)
      .then((data) => setRequests(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadingPending();
  }, [status, type]);

  async function handleApprove(id: string) {

    await apiFetch(`/validation/${id}/approve`, { method: 'POST' });
    loadingPending();
  }

  async function handleReject(id: string) {
    const comment = window.prompt('Motif du refus ?') || '';

    await apiFetch(`/validation/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
    loadingPending();
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Gestion des demandes</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Tous les statuts</option>
        <option value="PENDING">En attente</option>
        <option value="APPROVED">Approuvée</option>
        <option value="REJECTED">Rejetée</option>
        <option value="CANCELLED">Annulée</option>
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Tous les types</option>
        <option value="CP">CP</option>
        <option value="RTT">RTT</option>
        <option value="SANS_SOLDES">Sans solde</option>
        <option value="MALADIE">Maladie</option>
        <option value="FORMATION">Formation</option>
      </select>

      {requests.length === 0 && <p>Aucune demande.</p>}
      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.user.name} — {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
            {' '}({req.workingDays} jours) — statut : {req.status}
            {req.status === 'PENDING' && (
              <>
                {' '}
                <button onClick={() => handleApprove(req.id)}>Approuver</button>
                {' '}
                <button onClick={() => handleReject(req.id)}>Rejeter</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

}

export default validation;