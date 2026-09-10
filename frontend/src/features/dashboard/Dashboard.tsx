import { useState, useEffect, type SubmitEvent } from "react";

import { Paperclip } from "lucide-react";
import apiFetch from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { statusStyle } from "../../utils/statusStyle";

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
    const [document, setDocument] = useState<File | null>(null);

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

        if (new Date(endDate) < new Date(startDate)) {
            alert('La date de fin doit être après la date de début');
            return;
        }

        const formData = new FormData();
        formData.append('type', type);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('comment', comment);
        if (document) formData.append('document', document);

        try {
            await apiFetch('/requests', {
                method: 'POST',
                body: formData,
            });

            setStartDate('');
            setEndDate('');
            setComment('');
            setDocument(null)
            loadRequest();
        } catch (err) {
            alert((err as Error).message);
        }
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



    const today = new Date();
    const prochainConge = requests
        .filter((r) => r.status === 'APPROVED' && new Date(r.startDate) >= today)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

    if (loading) return <p className="p-8 text-gray-500">Chargement...</p>

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Mes demandes de congés</h1>

                <div className="flex gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex-1">
                        <p className="text-sm text-gray-500">CP restants</p>
                        <p className="text-2xl font-bold text-emerald-600">{user?.cpBalance}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex-1">
                        <p className="text-sm text-gray-500">RTT restants</p>
                        <p className="text-2xl font-bold text-emerald-600">{user?.rttBalance}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex-1">
                        <p className="text-sm text-gray-500">Demandes en attente</p>
                        <p className="text-2xl font-bold text-amber-500">
                            {requests.filter((r) => r.status === 'PENDING').length}
                        </p>
                    </div>
                </div>

                {prochainConge && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-4 mb-6">
                        <p className="text-sm text-emerald-700">
                            Prochain congé : <span className="font-semibold">{prochainConge.type}</span> du{' '}
                            {prochainConge.startDate.slice(0, 10)} au {prochainConge.endDate.slice(0, 10)}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Nouvelle demande</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="CP">CP</option>
                            <option value="RTT">RTT</option>
                            <option value="SANS_SOLDES">Sans solde</option>
                            <option value="MALADIE">Maladie</option>
                            <option value="FORMATION">Formation</option>
                        </select>
                        <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer text-sm text-gray-500 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                            <Paperclip size={16} className="text-gray-400" />
                            {document ? document.name : "Joindre un justificatif"}
                            <input
                                type="file"
                                onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
                                className="hidden"
                            />
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <input
                        placeholder="Commentaire"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Déposer la demande
                    </button>
                </form>

                {requests.length === 0 && <p className="text-gray-500">Aucune demande pour le moment.</p>}

                <div className="space-y-3">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            onClick={() => openDetail(req.id)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between cursor-pointer hover:border-emerald-300"
                        >
                            <div>
                                <p className="font-medium text-gray-900">
                                    {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
                                </p>
                                <p className="text-sm text-gray-500">{req.workingDays} jours</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(req.status)}`}>
                                    {req.status}
                                </span>
                                {req.status === 'PENDING' && (
                                    <button
                                        onClick={(e) => handleCancel(e, req.id)}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Détail de la demande</h2>
                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                            <p>Type : {selectedRequest.type}</p>
                            <p>Du {selectedRequest.startDate.slice(0, 10)} au {selectedRequest.endDate.slice(0, 10)}</p>
                            <p>Jours : {selectedRequest.workingDays}</p>
                            <p>Statut : <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(selectedRequest.status)}`}>{selectedRequest.status}</span></p>
                            {selectedRequest.comment && <p>Mon commentaire : {selectedRequest.comment}</p>}
                        </div>
                        {selectedRequest.validations.length > 0 && (
                            <div className="border-t border-gray-100 pt-3 mb-4 space-y-1 text-sm text-gray-600">
                                {selectedRequest.validations.map((v, i) => (
                                    <p key={i}>
                                        {v.validator.name} a {v.action === 'APPROVE' ? 'approuvé' : 'rejeté'}
                                        {v.comment ? ` — "${v.comment}"` : ''}
                                    </p>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setSelectedRequest(null)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;