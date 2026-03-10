import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectSessionState } from '../../store/selectors';
import { startSession } from '../../store/sessionSlice';
import { showToast } from '../../utils/toast';

type LoginNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Login'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigation>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();
  const { saving } = useAppSelector(selectSessionState);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast(t('messages.loginFieldsRequired'));
      return;
    }

    const resultAction = await dispatch(
      startSession({
        email,
      }),
    );

    if (startSession.rejected.match(resultAction)) {
      showToast(t(resultAction.payload ?? 'messages.loginFailed', { defaultValue: t('messages.loginFailed') }));
      return;
    }

    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

    if (!rootNavigation) {
      showToast(t('messages.navigationNotReady'));
      return;
    }

    rootNavigation.replace('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}> 
      <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{t('auth.loginTitle')}</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>{t('auth.loginSubtitle')}</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder={t('common.placeholders.email')}
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
        placeholder={t('common.placeholders.password')}
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
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed || saving ? 0.85 : 1,
          },
        ]}
      >
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{t('common.actions.login')}</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
        <Text style={[styles.linkText, { color: appTheme.colors.primary }]}>{t('auth.createAccountLink')}</Text>
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
