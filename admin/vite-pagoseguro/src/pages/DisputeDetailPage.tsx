import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import PagoSeguroLayout from '../components/PagoSeguroLayout';

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
    operatorNotes?: string;
    resolvedAt?: string;
  };
};

export default function DisputeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Leer lo que viene desde navigate(..., { state })
  const location = useLocation();
  const state = location.state as { tx?: Tx } | null;

  // Si viene tx en el state, la usamos de arranque
  const [tx, setTx] = useState<Tx | null>(state?.tx ?? null);
  const [notes, setNotes] = useState(state?.tx?.dispute?.operatorNotes ?? '');

  const loadTx = async () => {
    if (!id) return;

    try {
      const res = await api.get(`/transactions/${id}`);
      setTx(res.data);
      if (res.data.dispute?.operatorNotes) {
        setNotes(res.data.dispute.operatorNotes);
      }
    } catch (err) {
      console.error(err);
      // Si NO venimos desde la lista (sin state) y falla, regresamos
      if (!state?.tx) {
        alert('No se pudo cargar la transacción');
        navigate('/disputas');
      }
    }
  };

  useEffect(() => {
    // Solo llamo a la API si no tengo tx todavía
    if (!tx && id) {
      loadTx();
    }
  }, [id, tx]);

  const resolveDispute = async (
    outcome: 'REFUND_BUYER' | 'RELEASE_SELLER' | 'NO_ACTION',
  ) => {
    if (!id) return;

    const confirmText =
      outcome === 'REFUND_BUYER'
        ? '¿Confirmas reembolsar al comprador?'
        : outcome === 'RELEASE_SELLER'
        ? '¿Confirmas liberar el pago al vendedor?'
        : '¿Confirmas cerrar la disputa sin acción?';

    if (!window.confirm(confirmText)) return;

    try {
      await api.post(`/admin/disputes/${id}/resolve`, {
        outcome,
        operatorNotes: notes,
      });
      alert('Disputa resuelta correctamente.');
      navigate('/disputas');
    } catch (err) {
      console.error(err);
      alert('No se pudo resolver la disputa');
    }
  };

  if (!tx) {
    return <p className="text-sm text-slate-500">Cargando...</p>;
  }

  return (
    <PagoSeguroLayout title={`Disputa ${tx.id} – PagoSeguro Admin`}>
        <div className="space-y-6">
        <button
            onClick={() => navigate('/disputas')}
            className="text-xs text-blue-600 hover:underline"
        >
            ← Volver a disputas
        </button>

        <header className="flex items-center justify-between">
            <div>
            <h2 className="text-xl font-bold text-slate-800">
                Disputa {tx.id}
            </h2>
            <p className="text-sm text-slate-500">
                Creada el {new Date(tx.createdAt).toLocaleString('es-PE')}
            </p>
            </div>
            <div className="text-right text-xs">
            <p className="font-semibold text-slate-700">
                Estado transacción: {tx.status}
            </p>
            {tx.dispute && (
                <p className="text-slate-500">
                Estado disputa: {tx.dispute.status || 'OPEN'}
                </p>
            )}
            </div>
        </header>

        {/* Info principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
                Detalle de la operación
            </h3>
            <p>
                <span className="font-medium">Producto:</span> {tx.item}
            </p>
            <p>
                <span className="font-medium">Monto:</span> S/ {tx.amount.toFixed(2)}
            </p>
            <p>
                <span className="font-medium">Comprador:</span>{' '}
                {tx.buyerName || tx.buyerEmail}
            </p>
            <p>
                <span className="font-medium">Vendedor:</span>{' '}
                {tx.sellerName || tx.sellerEmail}
            </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
                Detalle de la disputa
            </h3>
            {tx.dispute ? (
                <>
                <p>
                    <span className="font-medium">Motivo:</span>{' '}
                    {tx.dispute.reason}
                </p>
                <p>
                    <span className="font-medium">Abierto por:</span>{' '}
                    {tx.dispute.openedBy === 'buyer'
                    ? 'Comprador'
                    : tx.dispute.openedBy === 'seller'
                    ? 'Vendedor'
                    : 'N/D'}
                </p>
                <p>
                    <span className="font-medium">Fecha apertura:</span>{' '}
                    {new Date(tx.dispute.openedAt).toLocaleString('es-PE')}
                </p>
                </>
            ) : (
                <p className="text-slate-500 text-xs">
                No hay información de disputa.
                </p>
            )}
            </div>
        </div>

        {/* Notas del operador */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <h3 className="text-sm font-semibold text-slate-700">
            Notas del operador
            </h3>
            <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100 min-h-[80px]"
            placeholder="Registra el análisis del caso y la justificación de la decisión."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            />
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-3 text-sm">
            <button
            onClick={() => resolveDispute('REFUND_BUYER')}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            >
            Reembolsar al comprador
            </button>
            <button
            onClick={() => resolveDispute('RELEASE_SELLER')}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
            Liberar pago al vendedor
            </button>
            <button
            onClick={() => resolveDispute('NO_ACTION')}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300"
            >
            Cerrar sin acción
            </button>
        </div>
        </div>
    </PagoSeguroLayout>
  );
}
