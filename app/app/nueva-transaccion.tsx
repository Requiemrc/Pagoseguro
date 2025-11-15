import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from "../config/api";
import { useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';

type TxStatus = 'SIN_CREAR' | 'PENDING_DEPOSIT' | 'HELD' | 'IN_DELIVERY' | 'COMPLETED' | 'DISPUTED';

// 🔹 Simulación tipo Yape: base de usuarios registrados
const MOCK_USERS = [
  { identifier: '999111222', name: 'Juan Pérez' },
  { identifier: '977333444', name: 'María López' },
  { identifier: '988777666', name: 'Carlos López' },
  { identifier: '999111222', name: 'Francisco Requena' },
];

export default function NewTransactionScreen() {
  // 📌 Usuario logueado (actúa como VENDEDOR en esta operación)
  const { userIdentifier, userName } = useLocalSearchParams<{
    userIdentifier: string;
    userName: string;
  }>();

  // Comprador
  const [buyerIdentifier, setBuyerIdentifier] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');

  // Vendedor (tú)
  const sellerEmail = userIdentifier;
  const sellerName = userName ?? '';

  // Detalle de transacción
  const [item, setItem] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<TxStatus>('SIN_CREAR');
  const [txId, setTxId] = useState<string | null>(null);

  // 🔍 Cuando se escribe el número/correo del comprador, buscamos su nombre
 const handleBuyerIdentifierChange = async (text: string) => {
  setBuyerIdentifier(text);

  const normalized = text.replace(/\s+/g, '');
  if (normalized.length < 6) {
    setBuyerName('');
    return;
  }

  try {
    const res = await api.get('/users/by-identifier', {
      params: { identifier: text },
    });
    setBuyerName(res.data.name);
  } catch {
    setBuyerName('');
  }
};


  // 🟦 Crear transacción en el backend
  const createTransaction = async () => {
    if (!sellerEmail || !buyerIdentifier || !item || !amount) {
      Alert.alert("Error", "Faltan datos (comprador, producto o monto).");
      return;
    }

    try {
      const response = await api.post("/transactions", {
        sellerEmail: sellerEmail,              // VENDEDOR = usuario logueado
        buyerEmail: buyerIdentifier,          // COMPRADOR = número/correo ingresado
        sellerName,
        buyerName,
        item,
        amount: Number(amount),
      });

      const tx = response.data;
      setTxId(tx.id);
      setStatus(tx.status);

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo crear la transacción");
    }
  };

  // 🔄 Cambiar estado real en el backend
  const updateTransaction = async (action: string) => {
    if (!txId) return;

    try {
      const response = await api.post(`/transactions/${txId}/action`, { action });
      setStatus(response.data.status);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo actualizar la transacción");
    }
  };

  
return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Nueva transacción</Text>
    <Text style={styles.subtitle}>
      Aquí el vendedor crea la orden de PagoSeguro.
    </Text>

    {/* VENDEDOR (TÚ) */}
    <View style={styles.field}>
      <Text style={styles.label}>Vendedor (tú)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={`${sellerName} (${sellerEmail})`}
        editable={false}
      />
    </View>

    {/* COMPRADOR */}
    <View style={styles.field}>
      <Text style={styles.label}>Número / correo del comprador</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 999111222 o correo"
        value={buyerIdentifier}
        onChangeText={handleBuyerIdentifierChange}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>Nombre del comprador</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={buyerName}
        editable={false}
      />
    </View>

    {/* DETALLE DE LA COMPRA */}
    <View style={styles.field}>
      <Text style={styles.label}>Producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: PS5, monitor, laptop"
        value={item}
        onChangeText={setItem}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>Monto (S/)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 1200"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
    </View>

    {status === 'SIN_CREAR' && (
      <TouchableOpacity style={styles.button} onPress={createTransaction}>
        <Text style={styles.buttonText}>Crear orden</Text>
      </TouchableOpacity>
    )}

    {status !== 'SIN_CREAR' && (
      <View style={styles.box}>
        <Text style={styles.label}>
          Orden creada correctamente.
        </Text>
        <Text style={styles.helperText}>
          Ahora el comprador debe entrar con su cuenta para ver esta transacción y realizar el pago.
        </Text>

        <TouchableOpacity
          style={styles.buttonSmall}
          onPress={() => {
            // volvemos al dashboard o a mis transacciones
            router.push({
              pathname: '/transacciones',
              params: { userIdentifier: sellerEmail },
            });
          }}
        >
          <Text style={styles.buttonText}>Ver mis transacciones</Text>
        </TouchableOpacity>
      </View>
    )}
  </ScrollView>
);
  
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonSmall: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  box: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4ff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonOutline: { backgroundColor: '#ffe4e6' },
  buttonOutlineText: { color: '#b91c1c' },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  field: {
    marginBottom: 10,
  },
});
