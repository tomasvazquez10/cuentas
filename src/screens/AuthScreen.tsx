import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '@utils/colors';
import { authService } from '@services/authService';
import { Button, Input } from '@components/index';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'El email es requerido';
    else if (!validateEmail(email)) newErrors.email = 'Email inválido';

    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    if (mode === 'signup') {
      if (!nombre) newErrors.nombre = 'El nombre es requerido';
      if (!confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
      else if (password !== confirmPassword)
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.signIn(email, password);
      Alert.alert('Éxito', 'Inicio de sesión exitoso');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.signUp(email, password, nombre);
      Alert.alert(
        'Éxito',
        'Cuenta creada. Por favor verifica tu email antes de iniciar sesión'
      );
      setMode('login');
      setEmail('');
      setPassword('');
      setNombre('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>Cuentas</Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChangeText={setNombre}
              error={errors.nombre}
            />
          )}

          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            error={errors.password}
          />

          {mode === 'signup' && (
            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              error={errors.confirmPassword}
            />
          )}

          <Button
            title={mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            onPress={mode === 'login' ? handleLogin : handleSignUp}
            loading={loading}
            fullWidth
            size="large"
          />

          <View style={styles.footer}>
            <Text style={styles.switchText}>
              {mode === 'login'
                ? '¿No tienes cuenta? '
                : '¿Ya tienes cuenta? '}
            </Text>
            <Text
              style={styles.switchLink}
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrors({});
              }}
            >
              {mode === 'login' ? 'Crear una' : 'Iniciar sesión'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.dark,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    elevation: 4,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
