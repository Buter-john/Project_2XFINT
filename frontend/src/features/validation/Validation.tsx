import { useState , useEffect } from "react";
import apiFetch from "../../utils/api";

interface LeaveRequest {

    id : string;
    type : string;
    startDate : string;
    endDate : string;
    workingDays : string; 
    comment : string | null;
    user: { name : string ; email : string };
}


function validation (){

    const [ requests , setRequests ] = useState <LeaveRequest[]>([]);
    const [ loading , setLoading ] = useState(true);


    function loadingPending(){
        apiFetch('/requests/pending')
        .then((data) => setRequests(data))
        .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadingPending();
    }, []);

    async function handleApprove (id:string){

        await apiFetch(`/validation/${id}/approve`, {method : 'POST'});
        loadingPending();
    }

    async function handleReject(id:string){
        const comment = window.prompt('Motif du refus ?') || '';

        await apiFetch(`/validation/${id}/reject`, {
            method: 'POST',
            body : JSON.stringify({ comment }), 
        });
        loadingPending();
    }
    
    if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Demandes en attente de validation</h1>
      {requests.length === 0 && <p>Aucune demande en attente.</p>}
      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.user.name} — {req.type} — du {req.startDate.slice(0, 10)} au {req.endDate.slice(0, 10)}
            {' '}({req.workingDays} jours){req.comment ? ` — "${req.comment}"` : ''}
            {' '}
            <button onClick={() => handleApprove(req.id)}>Approuver</button>
            {' '}
            <button onClick={() => handleReject(req.id)}>Rejeter</button>
          </li>
        ))}
      </ul>
    </div>
  );

}

export default validation;