import { useEffect , useState } from "react";
import apiFetch from "../../utils/api";
import { getDaysInMonth } from "../../utils/dateUtils";

interface LeaveRequest {

    id : string;
    type : string;
    startDate : string;
    endDate : string;
    user : { name : string ; department : { name : string } };
}

interface Department {
    id: number;
    name: string;
}

// Jours feries fixes (JJ-MM). Les feries mobiles (Paques...) ne sont pas geres.
const JOURS_FERIES = ['01-01', '01-05', '08-05', '14-07', '15-08', '01-11', '11-11', '25-12'];

function Calendar () {
     const [ requests , setRequests ] = useState<LeaveRequest[]> ([]);
     const [ departments , setDepartments ] = useState<Department[]>([]);
     const [ departmentId , setDepartmentId ] = useState('');

     const [ loading , setLoading ] = useState(true);

     const today = new Date ();
     const days = getDaysInMonth(today.getFullYear(),today.getMonth());

     function loadCalendar() {
        const params = new URLSearchParams();
        if (departmentId) params.set('departmentId', departmentId);

        apiFetch(`/requests/calendar?${params.toString()}`)
        .then((data) => setRequests(data))
        .finally(() => setLoading(false));
     }

     useEffect(()=> {
        loadCalendar();
     } , [departmentId]);

     useEffect(() => {
        apiFetch('/departments').then((data) => setDepartments(data));
     }, []);

     function isJourFerie(day: Date) {
        const dd = String(day.getDate()).padStart(2, '0');
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        return JOURS_FERIES.includes(`${dd}-${mm}`);
     }


    function getAbsencesForDay (day : Date){

        const dayUTC = Date.UTC(day.getFullYear(),day.getMonth(), day.getDate());

        return requests.filter((req) => {
            const start = new Date(req.startDate).getTime();
            const end = new Date(req.endDate).getTime();

            return dayUTC >= start && dayUTC <= end ;
        });
    }


     if (loading) return <p>Chargement...</p>;

     return (

    <div>
      <h1>Calendrier — {today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h1>

      <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
        <option value="">Tous les services</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      <ul>
        {days.map((day) => {
          const absences = getAbsencesForDay(day);
          const ferie = isJourFerie(day);
          return (
            <li key={day.toISOString()}>
              {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
              {ferie && ' — Jour férié'}
              {absences.length > 0 && (
                <ul>
                  {absences.map((a) => (
                    <li key={a.id}>{a.user.name} ({a.user.department.name}) — {a.type}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
    );

}

export default Calendar; 