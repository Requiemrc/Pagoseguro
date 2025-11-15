// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        options={{ title: 'Iniciar sesión' }}
      />
      <Stack.Screen
        name="dashboard"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="nueva-transaccion"
        options={{ title: 'Nueva transacción' }}
      />
      <Stack.Screen
        name="transacciones"
        options={{ title: 'Mis transacciones' }}
      />
    </Stack>
  );
}
