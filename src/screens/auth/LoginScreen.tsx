import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { showToast } from '../../utils/toast';

type LoginNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Login'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigation>();
  const { appTheme } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password.');
      return;
    }

    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

    if (!rootNavigation) {
      showToast('Navigation is not ready.');
      return;
    }

    rootNavigation.replace('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}> 
      <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Sign in to manage today&apos;s medical tasks.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor={appTheme.colors.textSecondary}
        style={[
          styles.input,
          {
            borderColor: appTheme.colors.border,
            color: appTheme.colors.textPrimary,
            borderRadius: appTheme.radius.md,
            backgroundColor: appTheme.colors.card,
          },
        ]}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={appTheme.colors.textSecondary}
        style={[
          styles.input,
          {
            borderColor: appTheme.colors.border,
            color: appTheme.colors.textPrimary,
            borderRadius: appTheme.radius.md,
            backgroundColor: appTheme.colors.card,
          },
        ]}
      />

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
        <Text style={[styles.linkText, { color: appTheme.colors.primary }]}>Create account</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 15,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  linkContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
