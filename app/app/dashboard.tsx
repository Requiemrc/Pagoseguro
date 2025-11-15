import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { Stack } from "expo-router";

export default function DashboardScreen() {
  const { userIdentifier, userName } = useLocalSearchParams<{
    userIdentifier: string;
    userName: string;
  }>();

  const handleLogout = () => {
    // Para el MVP, solo regresamos al login
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PagoSeguro Perú</Text>

      <Text style={styles.greeting}>Hola, {userName}</Text>
      <Text style={styles.identifier}>Cuenta: {userIdentifier}</Text>



      {/* Crear transacción (como vendedor) */}
      <Link
        href={{
          pathname: '/nueva-transaccion',
          params: { userIdentifier, userName },
        }}
        asChild
      >
        <TouchableOpacity style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Crear transacción</Text>
        </TouchableOpacity>
      </Link>

      {/* Ver todas mis transacciones (como comprador y vendedor) */}
      <Link
        href={{
          pathname: '/transacciones',
          params: { userIdentifier },
        }}
        asChild
      >
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Ver mis transacciones</Text>
        </TouchableOpacity>
      </Link>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
        <Text style={styles.buttonLogoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  identifier: {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 10,
  },
  buttonPrimaryText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 16,
  },
  buttonSecondaryText: {
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonLogout: {
    alignSelf: 'center',
    marginTop: 12,
  },
  buttonLogoutText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 13,
  },
});
