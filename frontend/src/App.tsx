import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login'

function Dashboard() {
  return <h1>Tableau de bord (à construire au chapitre 7)</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;