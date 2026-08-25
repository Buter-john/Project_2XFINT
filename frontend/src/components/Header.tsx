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
        <header>
            <nav>
                <Link to="/dashboard">Dashboard</Link>{' '}
                <Link to="/calendar">Calendrier</Link>{' '}
                {(user.role === 'MANAGER' || user.role === 'RH') && <Link to="/validation">Validation</Link>}{' '}
                {user.role === 'RH' && <Link to="/admin">Admin</Link>}{' '}
                <button onClick={logout}>Déconnexion</button>
            </nav>

            <button onClick={() => setOpen(!open)}>
                Notifications ({unreadCount})
            </button>

            {open && (
                <ul>
                    {notifications.length === 0 && <li>Aucune notification</li>}
                    {notifications.map((n) => (
                        <li key={n.id} style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>
                            {n.title} — {n.message}
                            {!n.isRead && <button onClick={() => handleMarkAsRead(n.id)}>Marquer lu</button>}
                        </li>
                    ))}
                </ul>
            )}
        </header>
    );
}

export default Header;