import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { STORAGE_KEYS } from '../../constants/storage';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { hydratePreferences } from '../../store/preferencesSlice';
import { hydrateSession } from '../../store/sessionSlice';
import { readJsonValue } from '../../utils/storage';

const SPLASH_MIN_DURATION_MS = 2200;

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Splash'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const scaleValue = useRef(new Animated.Value(1.2)).current;

  useEffect(() => {
    let isMounted = true;

    const runSplashAnimation = new Promise<void>(resolve => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => resolve());
    });

    const animationPromise = runSplashAnimation;

    const initializeApp = (async () => {
      const startedAt = Date.now();
      const [sessionResultAction, , onboardingCompleted] = await Promise.all([
        dispatch(hydrateSession()),
        dispatch(hydratePreferences()),
        readJsonValue<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false),
      ]);
      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, SPLASH_MIN_DURATION_MS - elapsed);

      if (remainingDelay > 0) {
        await Promise.all([
          animationPromise,
          new Promise<void>(resolve => {
            setTimeout(() => resolve(), remainingDelay);
          }),
        ]);
      } else {
        await animationPromise;
      }

      if (hydrateSession.fulfilled.match(sessionResultAction) && sessionResultAction.payload) {
        return 'Main';
      }

      return onboardingCompleted ? 'Auth' : 'Onboarding';
    })();

    initializeApp
      .then(nextScreen => {
        if (isMounted) {
          navigation.replace(nextScreen);
        }
      })
      .catch(() => {
        if (isMounted) {
          navigation.replace('Onboarding');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigation, scaleValue]);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <Animated.Image
        source={require('../../assets/splash.png')}
        style={[
          styles.splashImage,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  splashImage: {
    width: '100%',
    maxWidth: 320,
    maxHeight: 320,
    aspectRatio: 1,
  },
});

export default SplashScreen;
