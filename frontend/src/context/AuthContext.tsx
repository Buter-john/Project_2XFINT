import { createContext , useContext , useState , useEffect , type ReactNode } from 'react';

import apiFetch from '../utils/api';

interface User {

    id : string;
    name: string;
    email: string;
    role: string;
    cpBalance: string;
    rttBalance: string;
}

interface AuthContextType {
    user : User | null ;
    loading : boolean;
    login : (email : string , password : string ) => Promise<void>;
    logout : () => void ;
}

const AuthContext = createContext < AuthContextType | undefined >(undefined);

export function AuthProvider ({ children } : { children : ReactNode }) {

    const [ user , setUser ] = useState< User | null >(null);
    const [ loading , setLoading ] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        apiFetch('/auth/me')
            .then((data) => setUser(data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    }, []);

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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 

export function useAuth(){
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit etre utilise a l\'interieur d\'un AuthProvider');
    return context;
}