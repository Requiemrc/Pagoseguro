// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DisputesPage from './pages/DisputesPage';
import DisputeDetailPage from './pages/DisputeDetailPage';

export type OperatorUser = {
  id: string;
  name: string;
};

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [operator, setOperator] = useState<OperatorUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pagoseguro_operator');
    if (stored) {
      setOperator(JSON.parse(stored));
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!operator) {
    return null; // se redirige a /login
  }

  const handleLogout = () => {
    localStorage.removeItem('pagoseguro_operator');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">PagoSeguro Admin</h1>
          <p className="text-xs text-slate-500">Panel de operadores</p>
        </div>
        <nav className="flex-1 space-y-2 text-sm">
          <button
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 font-medium text-slate-800"
            onClick={() => navigate('/disputas')}
          >
            Disputas
          </button>
        </nav>
        <div className="mt-4 border-t pt-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700">{operator.name}</p>
          <button
            onClick={handleLogout}
            className="mt-1 text-red-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem('pagoseguro_operator');
  if (!stored) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Panel protegido */}
      <Route
        path="/disputas"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DisputesPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputas/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DisputeDetailPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/disputas" replace />} />
      <Route path="*" element={<Navigate to="/disputas" replace />} />
    </Routes>
  );
}
