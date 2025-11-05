import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      setError('Credenciales inválidas. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Settings size={48} color={Colors.industrial.primary} />
          </View>
          <Text style={styles.title}>Sistema de Gestión</Text>
          <Text style={styles.subtitle}>Mantenimiento de Maquinaria Pesada</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@sistema.com"
              placeholderTextColor={Colors.industrial.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.industrial.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.industrial.text} />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.industrial.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.industrial.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.industrial.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.industrial.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.industrial.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.industrial.text,
  },
  errorText: {
    color: Colors.industrial.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.industrial.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonPressed: {
    backgroundColor: Colors.industrial.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.industrial.text,
    fontSize: 16,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.industrial.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: Colors.industrial.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  quickAccessButton: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickAccessButtonPressed: {
    backgroundColor: Colors.industrial.surfaceHover,
    transform: [{ scale: 0.95 }],
  },
  quickAccessText: {
    color: Colors.industrial.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
