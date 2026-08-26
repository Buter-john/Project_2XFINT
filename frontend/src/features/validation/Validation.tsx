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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  function loadingPending() {

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', String(page));
    params.set('limit', '5');

    apiFetch(`/requests/pending?${params.toString()}`)
      .then((data) => {
        setRequests(data.requests);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadingPending();
  }, [status, type, search, sortBy, sortOrder, page]);

  useEffect(() => {
    setPage(1);
  }, [status, type, search, sortBy, sortOrder]);

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

      <input
        placeholder="Rechercher un employé"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="createdAt">Trier par date de création</option>
        <option value="startDate">Trier par date de début</option>
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="desc">Décroissant</option>
        <option value="asc">Croissant</option>
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

      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
      {' '}Page {page} / {totalPages}{' '}
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Suivant</button>
    </div>
  );

}

export default validation;