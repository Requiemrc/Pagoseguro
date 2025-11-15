// src/pages/LoginPage.tsx
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OperatorUser } from '../App';

export default function LoginPage() {
  const [email, setEmail] = useState('operador@pagoseguro.pe');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (email === 'operador@pagoseguro.pe' && password === 'admin123') {
      const user: OperatorUser = {
        id: 'OP1',
        name: 'Operador PagoSeguro',
      };

      localStorage.setItem('pagoseguro_operator', JSON.stringify(user));
      navigate('/disputas', { replace: true });
    } else {
      alert('Credenciales inválidas. Usa operador@pagoseguro.pe / admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            PagoSeguro Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inicia sesión para gestionar disputas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="operador@pagoseguro.pe"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700 font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="admin123"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
