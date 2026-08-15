import { useState, useEffect, type SubmitEvent } from "react";

import apiFetch from "../../utils/api";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    workingDays: string;
    status: string;
    comment: string | null;
}

function Dashboard() {

    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <>Chargement...</>
    return (
        <div>
            <h1>Mes demandes de congés</h1>

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
                    <li key={req.id}>
                        {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
                        {' '}({req.workingDays} jours) — statut : {req.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;