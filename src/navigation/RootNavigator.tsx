import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '../hooks/useAppTheme';
import i18n from '../i18n';
import OnboardingScreen from '../screens/onboardingauth/OnboardingScreen';
import SplashScreen from '../screens/splash/SplashScreen';
import { useAppSelector } from '../store/hooks';
import { selectAppLanguage } from '../store/selectors';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { appTheme, navigationTheme } = useAppTheme();
  const language = useAppSelector(selectAppLanguage);

  useEffect(() => {
    if (i18n.language === language) {
      return;
    }

    i18n.changeLanguage(language).catch(() => undefined);
  }, [language]);

  return (
    <>
      <StatusBar
        translucent={false}
        barStyle={appTheme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={appTheme.colors.background}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default RootNavigator;
