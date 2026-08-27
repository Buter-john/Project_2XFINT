import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiFetch from "../../utils/api";
import { getCalendarGrid } from "../../utils/dateUtils";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    user: { name: string; department: { name: string } };
}

interface Department {
    id: number;
    name: string;
}

const JOURS_FERIES = ['01-01', '01-05', '08-05', '14-07', '15-08', '01-11', '11-11', '25-12'];

const TYPE_COLOR: Record<string, string> = {
    CP: 'bg-blue-500',
    RTT: 'bg-green-500',
    SANS_SOLDES: 'bg-orange-500',
    MALADIE: 'bg-red-500',
    FORMATION: 'bg-cyan-500',
};

const TYPE_LABEL: Record<string, string> = {
    CP: 'Congés Payés (CP)',
    RTT: 'RTT',
    SANS_SOLDES: 'Exceptionnels / Sans solde',
    MALADIE: 'Maladie',
    FORMATION: 'Formation',
};

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function Calendar() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentId, setDepartmentId] = useState('');
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const grid = getCalendarGrid(viewDate.getFullYear(), viewDate.getMonth());

    function goToPreviousMonth() {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    }

    function goToNextMonth() {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    }

    function loadCalendar() {
        const params = new URLSearchParams();
        if (departmentId) params.set('departmentId', departmentId);

        apiFetch(`/requests/calendar?${params.toString()}`)
            .then((data) => setRequests(data))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadCalendar();
    }, [departmentId]);

    useEffect(() => {
        apiFetch('/departments').then((data) => setDepartments(data));
    }, []);

    function isJourFerie(day: Date) {
        const dd = String(day.getDate()).padStart(2, '0');
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        return JOURS_FERIES.includes(`${dd}-${mm}`);
    }

    function isToday(day: Date) {
        return day.toDateString() === today.toDateString();
    }

    function getAbsencesForDay(day: Date) {
        const dayUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());

        return requests.filter((req) => {
            const start = new Date(req.startDate).getTime();
            const end = new Date(req.endDate).getTime();
            return dayUTC >= start && dayUTC <= end;
        });
    }

    if (loading) return <p className="p-8 text-gray-500">Chargement...</p>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 capitalize w-48 text-center">
                            {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h1>
                        <button
                            onClick={goToNextMonth}
                            className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Tous les services</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-gray-100">
                        {WEEKDAY_LABELS.map((label) => (
                            <div key={label} className="px-3 py-2 text-xs font-medium text-gray-400 text-center">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {grid.map(({ date, isCurrentMonth }) => {
                            const absences = getAbsencesForDay(date);
                            const ferie = isJourFerie(date);
                            const visibleAbsences = absences.slice(0, 2);
                            const hiddenCount = absences.length - visibleAbsences.length;

                            return (
                                <div
                                    key={date.toISOString()}
                                    className={`border-r border-b border-gray-100 min-h-[90px] p-2 ${!isCurrentMonth ? 'bg-gray-50' : ferie ? 'bg-amber-50' : ''}`}
                                >
                                    {isToday(date) ? (
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                                            {date.getDate()}
                                        </span>
                                    ) : (
                                        <span className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                                            {date.getDate()}
                                        </span>
                                    )}

                                    {absences.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {visibleAbsences.map((a) => (
                                                <div
                                                    key={a.id}
                                                    title={`${a.user.name} — ${a.type}`}
                                                    className="flex items-center gap-1 text-[11px] text-gray-700 truncate"
                                                >
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLOR[a.type] || 'bg-gray-400'}`} />
                                                    <span className="truncate">{a.user.name}</span>
                                                </div>
                                            ))}
                                            {hiddenCount > 0 && (
                                                <p className="text-[11px] text-gray-400">+{hiddenCount} autre{hiddenCount > 1 ? 's' : ''}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Légende :</span>
                    {Object.entries(TYPE_LABEL).map(([type, label]) => (
                        <span key={type} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-sm ${TYPE_COLOR[type]}`} />
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
