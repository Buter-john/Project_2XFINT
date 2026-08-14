import { createContext , useContext , useState , type ReactNode } from 'react';

import apiFetch from '../utils/api';

interface User {

    id : string; 
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user : User | null ;
    login : (email : string , password : string ) => Promise<void>;
    logout : () => void ; 
}

const AuthContext = createContext < AuthContextType | undefined >(undefined); 

export function AuthProvider ({ children } : { children : ReactNode }) {

    const [ user , setUser ] = useState< User | null >(null); 

    async function login (email : string , password: string) {

               const data =  await apiFetch('/auth/login' , {

                method : 'POST',
                body: JSON.stringify({ email , password }),

               });

               localStorage.setItem('token', data.token);
               setUser(data.user);
    }

    function logout(){
        localStorage.removeItem('token')
        setUser(null);
    }

    return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 

export function useAuth(){
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit etre utilise a l\'interieur d\'un AuthProvider');
    return context;
}