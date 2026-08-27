import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiFetch from '../utils/api';

interface Notification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

function Header() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);

    function loadNotifications() {
        if (!user) return;
        apiFetch('/notifications').then((data) => setNotifications(data));
    }

    useEffect(() => {
        loadNotifications();
    }, [user]);

    async function handleMarkAsRead(id: number) {
        await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
        loadNotifications();
    }

    if (!user) return null;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <nav className="flex items-center gap-4 text-sm text-gray-700">
                <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <Link to="/calendar" className="hover:text-blue-600">Calendrier</Link>
                <Link to="/profile" className="hover:text-blue-600">Profil</Link>
                {(user.role === 'MANAGER' || user.role === 'RH') && (
                    <Link to="/validation" className="hover:text-blue-600">Validation</Link>
                )}
                {user.role === 'RH' && <Link to="/admin" className="hover:text-blue-600">Admin</Link>}
                <button onClick={logout} className="text-red-600 hover:text-red-700">Déconnexion</button>
            </nav>

            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="bg-gray-100 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                >
                    Notifications ({unreadCount})
                </button>

                {open && (
                    <ul className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm">
                        {notifications.length === 0 && <li className="text-gray-500 p-2">Aucune notification</li>}
                        {notifications.map((n) => (
                            <li key={n.id} className={`p-2 border-b border-gray-100 last:border-0 ${n.isRead ? 'text-gray-500' : 'font-bold text-gray-900'}`}>
                                {n.title} — {n.message}
                                {!n.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="block text-blue-600 text-xs mt-1 font-normal hover:underline"
                                    >
                                        Marquer lu
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </header>
    );
}

export default Header;