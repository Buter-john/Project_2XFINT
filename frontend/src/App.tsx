import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login'
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';
import Validation from './features/validation/Validation';
import Calendar from './features/calendar/Calendar';
import Admin from './features/admin/Admin';
import Header from './components/Header';


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/validation" element={<ProtectedRoute roles={['MANAGER', 'RH']}><Validation /> </ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['RH']}><Admin /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;