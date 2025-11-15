import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../config/api';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');

  const handleLogin = async () => {
  if (!identifier) {
    Alert.alert('Campos incompletos', 'Ingresa tu correo o número.');
    return;
  }

  try {
    const res = await api.get('/users/by-identifier', {
      params: { identifier },
    });

    const user = res.data;

    router.replace({
      pathname: '/dashboard',
      params: {
        userIdentifier: user.phone || user.email,
        userName: user.name,
      },
    });
  } catch (err: any) {
    console.log(err.response?.data || err.message);
    Alert.alert('Error', 'Usuario no encontrado. Usa un número/correo registrado.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicia sesión</Text>
      <Text style={styles.subtitle}>
        Usa tu número o correo registrado para entrar.
      </Text>

      <Text style={styles.label}>Correo o número de celular</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 999111222 o tu correo"
        value={identifier}
        onChangeText={setIdentifier}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
