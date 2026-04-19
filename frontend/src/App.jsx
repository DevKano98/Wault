import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import BeneficiaryAccessPage from './pages/BeneficiaryAccessPage';
import FamilyPage from './pages/FamilyPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import VaultPage from './pages/VaultPage';
import VerifyPage from './pages/VerifyPage';

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <AutorenewRoundedIcon className="h-8 w-8 animate-spin text-brand" />
    </div>
  );
}

function PrivateRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify/:token" element={<VerifyPage />} />
      <Route path="/access/:id" element={<BeneficiaryAccessPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
