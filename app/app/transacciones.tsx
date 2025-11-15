import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../config/api';

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
  dispute?: {
    reason: string;
    openedBy: 'buyer' | 'seller' | 'unknown';
    openedAt: string;
    status?: 'OPEN' | 'RESOLVED';
    outcome?: 'REFUND_BUYER' | 'RELEASE_SELLER' | 'NO_ACTION';
  };
};

export default function TransaccionesScreen() {
  const { userIdentifier } = useLocalSearchParams<{ userIdentifier: string }>();

  const [buyerTxs, setBuyerTxs] = useState<Tx[]>([]);
  const [sellerTxs, setSellerTxs] = useState<Tx[]>([]);

  // estado para el formulario de disputa
  const [disputeTxId, setDisputeTxId] = useState<string | null>(null);
  const [disputeRole, setDisputeRole] = useState<'buyer' | 'seller' | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const getStatusLabel = (tx: Tx, perspective: 'buyer' | 'seller') => {
  switch (tx.status) {
    case 'PENDING_DEPOSIT':
      return 'Pendiente de pago';
    case 'HELD':
      return 'Pago retenido por PagoSeguro';
    case 'IN_DELIVERY':
      return 'En entrega';
    case 'COMPLETED':
      return 'Completada';
    case 'DISPUTED':
      return 'En disputa';
    case 'REFUNDED_BUYER':
      return perspective === 'buyer'
        ? 'Resuelta: reembolso a tu favor'
        : 'Resuelta: dinero devuelto al comprador';
    case 'RELEASED_TO_SELLER':
      return perspective === 'seller'
        ? 'Resuelta: pago liberado a tu favor'
        : 'Resuelta: pago enviado al vendedor';
    default:
      return tx.status;
  }
  };

  const isResolved = (tx: Tx) =>
    tx.status === 'COMPLETED' ||
    tx.status === 'REFUNDED_BUYER' ||
    tx.status === 'RELEASED_TO_SELLER';

  useEffect(() => {
    if (!userIdentifier) return;

    // Como COMPRADOR
    api
      .get('/transactions', {
        params: { role: 'buyer', email: userIdentifier },
      })
      .then(res => setBuyerTxs(res.data))
      .catch(err => console.log('Error buyer txs =>', err));

    // Como VENDEDOR
    api
      .get('/transactions', {
        params: { role: 'seller', email: userIdentifier },
      })
      .then(res => setSellerTxs(res.data))
      .catch(err => console.log('Error seller txs =>', err));
  }, [userIdentifier]);

  const updateTransaction = async (
    id: string,
    action: string,
    extra?: { reason?: string; openedBy?: 'buyer' | 'seller' }
  ) => {
    try {
      const res = await api.post(`/transactions/${id}/action`, {
        action,
        ...extra,
      });
      const updated = res.data as Tx;

      setBuyerTxs(prev => prev.map(tx => (tx.id === updated.id ? updated : tx)));
      setSellerTxs(prev => prev.map(tx => (tx.id === updated.id ? updated : tx)));
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'No se pudo actualizar la transacción');
    }
  };

  // abrir el mini formulario de disputa
  const startDispute = (txId: string, role: 'buyer' | 'seller') => {
    setDisputeTxId(txId);
    setDisputeRole(role);
    setDisputeReason('');
  };

  const confirmDispute = async () => {
    if (!disputeTxId || !disputeRole) return;

    if (!disputeReason.trim()) {
      Alert.alert('Motivo requerido', 'Describe brevemente el problema.');
      return;
    }

    await updateTransaction(disputeTxId, 'dispute', {
      reason: disputeReason,
      openedBy: disputeRole,
    });

    setDisputeTxId(null);
    setDisputeRole(null);
    setDisputeReason('');
  };

  const cancelDispute = () => {
    setDisputeTxId(null);
    setDisputeRole(null);
    setDisputeReason('');
  };

  // pequeño componente reutilizable para cada tarjeta
  const renderDisputeInfo = (tx: Tx) => {
    if (tx.status !== 'DISPUTED' || !tx.dispute) return null;

    return (
      <View style={styles.disputeBox}>
        <Text style={styles.disputeTitle}>Transacción en disputa</Text>
        <Text style={styles.disputeText}>Motivo: {tx.dispute.reason}</Text>
        <Text style={styles.disputeText}>
          Abierto por: {tx.dispute.openedBy === 'buyer' ? 'Comprador' : tx.dispute.openedBy === 'seller' ? 'Vendedor' : 'N/D'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis transacciones</Text>
      <Text style={styles.subtitle}>
        Aquí verás las operaciones donde participas como comprador o vendedor.
      </Text>

      {/* FORMULARIO DE DISPUTA */}
      {disputeTxId && (
        <View style={styles.disputeForm}>
          <Text style={styles.disputeFormTitle}>Abrir disputa</Text>
          <Text style={styles.disputeFormText}>
            Describe brevemente el problema con esta transacción.
          </Text>
          <TextInput
            style={styles.disputeInput}
            placeholder="Ej: El producto no coincide con la publicación."
            value={disputeReason}
            onChangeText={setDisputeReason}
            multiline
          />
          <View style={styles.disputeButtonsRow}>
            <TouchableOpacity style={styles.disputeCancel} onPress={cancelDispute}>
              <Text style={styles.disputeCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.disputeConfirm} onPress={confirmDispute}>
              <Text style={styles.disputeConfirmText}>Confirmar disputa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* COMO COMPRADOR */}
      <Text style={styles.sectionTitle}>Como comprador</Text>
      {buyerTxs.length === 0 ? (
        <Text style={styles.emptyText}>Aún no tienes compras registradas.</Text>
      ) : (
        buyerTxs.map(tx => (
          <View key={tx.id} style={styles.card}>
            <Text style={styles.item}>{tx.item}</Text>
            <Text style={styles.line}>Vendedor: {tx.sellerName || tx.sellerEmail}</Text>
            <Text style={styles.line}>Monto: S/ {tx.amount}</Text>
            <Text style={styles.status}>
              Estado: {getStatusLabel(tx, 'buyer')}
            </Text>

            {renderDisputeInfo(tx)}

            {tx.status === 'PENDING_DEPOSIT' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => updateTransaction(tx.id, 'deposit')}
              >
                <Text style={styles.buttonText}>Pagar (depositar)</Text>
              </TouchableOpacity>
            )}

            {tx.status === 'IN_DELIVERY' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => updateTransaction(tx.id, 'release')}
              >
                <Text style={styles.buttonText}>Confirmar recepción</Text>
              </TouchableOpacity>
            )}

            {!isResolved(tx) && tx.status !== 'DISPUTED' && (
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => startDispute(tx.id, 'buyer')}
              >
                <Text style={[styles.buttonText, styles.buttonOutlineText]}>
                  Abrir disputa
                </Text>
              </TouchableOpacity>
            )}
            
          </View>
        ))
      )}

      {/* COMO VENDEDOR */}
      <Text style={styles.sectionTitle}>Como vendedor</Text>
      {sellerTxs.length === 0 ? (
        <Text style={styles.emptyText}>Aún no tienes ventas registradas.</Text>
      ) : (
        sellerTxs.map(tx => (
          <View key={tx.id} style={styles.card}>
            <Text style={styles.item}>{tx.item}</Text>
            <Text style={styles.line}>Comprador: {tx.buyerName || tx.buyerEmail}</Text>
            <Text style={styles.line}>Monto: S/ {tx.amount}</Text>
            <Text style={styles.status}>
              Estado: {getStatusLabel(tx, 'seller')}
            </Text>

            {renderDisputeInfo(tx)}

            {tx.status === 'HELD' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => updateTransaction(tx.id, 'start-delivery')}
              >
                <Text style={styles.buttonText}>Iniciar entrega</Text>
              </TouchableOpacity>
            )}

            {!isResolved(tx) && tx.status !== 'DISPUTED' && (
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => startDispute(tx.id, 'seller')}
              >
                <Text style={[styles.buttonText, styles.buttonOutlineText]}>
                  Abrir disputa
                </Text>
              </TouchableOpacity>
            )}

          
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#555', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 13, color: '#777', fontStyle: 'italic' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  item: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  line: { fontSize: 13, color: '#555' },
  status: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: 13 },
  buttonOutline: { backgroundColor: '#ffe4e6' },
  buttonOutlineText: { color: '#b91c1c' },

  // disputa
  disputeBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    marginTop: 4,
  },
  disputeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 2,
  },
  disputeText: {
    fontSize: 12,
    color: '#7f1d1d',
  },
  disputeForm: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  disputeFormTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    color: '#b91c1c',
  },
  disputeFormText: {
    fontSize: 12,
    color: '#7f1d1d',
    marginBottom: 8,
  },
  disputeInput: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  disputeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  disputeCancel: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  disputeCancelText: {
    fontSize: 13,
    color: '#6b7280',
  },
  disputeConfirm: {
    backgroundColor: '#b91c1c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  disputeConfirmText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
