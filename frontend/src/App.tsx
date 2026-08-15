import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login'
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './features/dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>        
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;