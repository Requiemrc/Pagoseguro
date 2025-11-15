import { StyleSheet, Text, View } from 'react-native';

export default function TransaccionesVendedorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones como vendedor</Text>
      <Text style={styles.text}>
        En esta versión MVP, esta pantalla representa el panel donde el vendedor
        vería las transacciones en las que participa. Más adelante, cuando se
        conecte al backend, aquí se listarán solo las operaciones donde el usuario
        es vendedor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  text: { fontSize: 14, color: '#555', lineHeight: 20 },
});
