import { type ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';


function ProtectedRoute ({children, roles } : { children : ReactNode , roles? : string []}){

    const { user, loading } = useAuth();

    if (loading){
        return <p>Chargement...</p>
    }

    if (!user){
        return <Navigate to="/login"/>
    }

    if (roles && !roles.includes(user.role)){

         return <Navigate to="/dashboard" />;
    }

    return <>{children}</>
}

export default ProtectedRoute; 