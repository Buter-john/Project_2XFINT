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

function Calendar () {
     const [ requests , setRequests ] = useState<LeaveRequest[]> ([]);

     const [ loading , setLoading ] = useState(true); 

     const today = new Date ();
     const days = getDaysInMonth(today.getFullYear(),today.getMonth());

     useEffect(()=> {
        apiFetch('/requests/calendar')
        .then((data) => setRequests(data))
        .finally(() => setLoading(false));
     } , []); 


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
      <ul>
        {days.map((day) => {
          const absences = getAbsencesForDay(day);
          return (
            <li key={day.toISOString()}>
              {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
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