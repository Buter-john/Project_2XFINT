import { useState, useEffect, type SubmitEvent } from "react";


import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    workingDays: string;
    status: string;
    comment: string | null;
}

interface Validation {

    action: string;
    comment: string | null;
    validator: { name: string };
}

interface RequestDetail extends LeaveRequest {
    validations: Validation[];
}

function Dashboard() {

    const { user } = useAuth();

    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null);

    const [type, setType] = useState('CP');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comment, setComment] = useState('');


    function loadRequest() {
        apiFetch('/requests')
            .then((data) => setRequests(data))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadRequest();
    }, []);


    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        await apiFetch('/requests', {
            method: 'POST',
            body: JSON.stringify({ type, startDate, endDate, comment }),
        });

        setStartDate('');
        setEndDate('');
        setComment('');
        loadRequest();
    }

    async function openDetail(id: string) {
        const data = await apiFetch(`/requests/${id}`);
        setSelectedRequest(data);
    }

    async function handleCancel(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        await apiFetch(`/requests/${id}`, { method: 'DELETE' });
        loadRequest();
    }

    if (loading) return <>Chargement...</>

    return (
        <div>
            <h1>Mes demandes de congés</h1>
            <p>CP restants : {user?.cpBalance} — RTT restants : {user?.rttBalance}</p>
            <form onSubmit={handleSubmit}>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="CP">CP</option>
                    <option value="RTT">RTT</option>
                    <option value="SANS_SOLDES">Sans solde</option>
                    <option value="MALADIE">Maladie</option>
                    <option value="FORMATION">Formation</option>
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                <input placeholder="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button type="submit">Déposer la demande</button>
            </form>

            {requests.length === 0 && <p>Aucune demande pour le moment.</p>}
            <ul>
                {requests.map((req) => (
                    <li key={req.id} onClick={() => openDetail(req.id)} style={{ cursor: 'pointer' }}>
                        {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
                        {' '}({req.workingDays} jours) — statut : {req.status}
                        {req.status === 'PENDING' && (
                            <button onClick={(e) => handleCancel(e, req.id)}>Annuler</button>
                        )}
                    </li>
                ))}
            </ul>

            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', color: 'black', padding: 24, borderRadius: 8, minWidth: 300 }}>
                        <h2>Détail de la demande</h2>
                        <p>Type : {selectedRequest.type}</p>
                        <p>Du {selectedRequest.startDate.slice(0, 10)} au {selectedRequest.endDate.slice(0, 10)}</p>
                        <p>Jours : {selectedRequest.workingDays}</p>
                        <p>Statut : {selectedRequest.status}</p>
                        {selectedRequest.comment && <p>Mon commentaire : {selectedRequest.comment}</p>}
                        {selectedRequest.validations.map((v, i) => (
                            <p key={i}>
                                {v.validator.name} a {v.action === 'APPROVE' ? 'approuvé' : 'rejeté'}
                                {v.comment ? ` — "${v.comment}"` : ''}
                            </p>
                        ))}
                        <button onClick={() => setSelectedRequest(null)}>Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;