import { useState, useEffect } from "react";
import apiFetch from "../../utils/api";
import { statusStyle } from "../../utils/statusStyle";


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

  if (loading) return <p className="p-8 text-gray-500">Chargement...</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des demandes</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvée</option>
            <option value="REJECTED">Rejetée</option>
            <option value="CANCELLED">Annulée</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
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
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="createdAt">Trier par date de création</option>
            <option value="startDate">Trier par date de début</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>

        {requests.length === 0 && <p className="text-gray-500">Aucune demande.</p>}

        <div className="space-y-3 mb-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {req.user.name} — {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
                </p>
                <p className="text-sm text-gray-500">{req.workingDays} jours</p>
                {req.comment && (
                  <p className="text-sm text-gray-600 italic mt-1">"{req.comment}"</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(req.status)}`}>
                  {req.status}
                </span>
                {req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Précédent
          </button>
          <span>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );

}

export default validation;