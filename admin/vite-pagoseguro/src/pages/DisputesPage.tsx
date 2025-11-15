import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type TxStatus =
  | 'PENDING_DEPOSIT'
  | 'HELD'
  | 'IN_DELIVERY'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED_BUYER'
  | 'RELEASED_TO_SELLER';

type Tx = {
  id: string;
  buyerEmail: string;
  sellerEmail: string;
  buyerName?: string;
  sellerName?: string;
  item: string;
  amount: number;
  status: TxStatus;
  createdAt: string;
  dispute?: {
    reason: string;
    openedBy: 'buyer' | 'seller' | 'unknown';
    openedAt: string;
    status?: 'OPEN' | 'RESOLVED';
    outcome?: 'REFUND_BUYER' | 'RELEASE_SELLER' | 'NO_ACTION';
  };
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', {
        params: { status: 'DISPUTED' },
      });
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar las disputas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const totalMonto = disputes.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar ya la tendrás en tu layout general, esto es solo el contenido principal */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Título */}
          <h1 className="text-center text-lg font-semibold text-sky-800 mb-4">
            Disputas – PagoSeguro Admin
          </h1>

          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            {/* Header de la card */}
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Disputas abiertas
                </h2>
                <p className="text-xs text-slate-500">
                  Gestiona las operaciones que presentan problemas entre comprador y vendedor.
                </p>
              </div>
              <button
                onClick={loadDisputes}
                className="px-3 py-1.5 text-xs rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600"
              >
                Actualizar
              </button>
            </header>

            {/* Cards de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-500">Disputas abiertas</p>
                <p className="text-xl font-bold text-slate-800">{disputes.length}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-500">Monto involucrado</p>
                <p className="text-xl font-bold text-slate-800">S/ {totalMonto.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-500">Última actualización</p>
                <p className="text-xs text-slate-700">
                  {new Date().toLocaleString('es-PE')}
                </p>
              </div>
            </div>

            {/* Tabla */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-3 py-2">ID</th>
                    <th className="text-left px-3 py-2">Producto</th>
                    <th className="text-left px-3 py-2">Comprador</th>
                    <th className="text-left px-3 py-2">Vendedor</th>
                    <th className="text-right px-3 py-2">Monto</th>
                    <th className="text-left px-3 py-2">Motivo</th>
                    <th className="text-left px-3 py-2">Abierto por</th>
                    <th className="text-center px-3 py-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-4 text-center text-slate-500 text-xs"
                      >
                        Cargando disputas...
                      </td>
                    </tr>
                  )}

                  {!loading && disputes.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-4 text-center text-slate-500 text-xs"
                      >
                        No hay disputas abiertas.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    disputes.map(tx => (
                      <tr
                        key={tx.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-[11px] text-slate-500">
                          {tx.id}
                        </td>
                        <td className="px-3 py-2">{tx.item}</td>
                        <td className="px-3 py-2 text-[11px]">
                          {tx.buyerName || tx.buyerEmail}
                        </td>
                        <td className="px-3 py-2 text-[11px]">
                          {tx.sellerName || tx.sellerEmail}
                        </td>
                        <td className="px-3 py-2 text-right">
                          S/ {tx.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-[11px] max-w-xs truncate">
                          {tx.dispute?.reason}
                        </td>
                        <td className="px-3 py-2 text-[11px]">
                          {tx.dispute?.openedBy === 'buyer'
                            ? 'Comprador'
                            : tx.dispute?.openedBy === 'seller'
                            ? 'Vendedor'
                            : 'N/D'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            className="px-3 py-1 rounded-full bg-sky-500 text-white text-[11px] font-semibold hover:bg-sky-600"
                            onClick={() =>
                              navigate(`/disputas/${tx.id}`, { state: { tx } })
                            }
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
