import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectSessionState } from '../../store/selectors';
import { startSession } from '../../store/sessionSlice';
import { showToast } from '../../utils/toast';

type SignupNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Signup'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupNavigation>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { saving } = useAppSelector(selectSessionState);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill all fields.');
      return;
    }

    const resultAction = await dispatch(
      startSession({
        fullName,
        email,
      }),
    );

    if (startSession.rejected.match(resultAction)) {
      showToast(resultAction.payload ?? 'Unable to create account right now.');
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
      <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Create account</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Set up your workspace and start managing tasks.</Text>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
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
        disabled={saving}
        onPress={handleSignup}
        style={({ pressed }) => [
          styles.button,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed || saving ? 0.85 : 1,
          },
        ]}
      >
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
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
});

export default SignupScreen;
