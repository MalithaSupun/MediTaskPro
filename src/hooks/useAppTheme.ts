import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppSelector } from '../store/hooks';
import { selectThemeMode } from '../store/selectors';
import { getAppTheme, getNavigationTheme, resolveThemeScheme } from '../theme/theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themeMode = useAppSelector(selectThemeMode);

  return useMemo(() => {
    const resolvedScheme = resolveThemeScheme(colorScheme, themeMode);
    const appTheme = getAppTheme(resolvedScheme);

    return {
      appTheme,
      navigationTheme: getNavigationTheme(appTheme),
      themeMode,
    };
  }, [colorScheme, themeMode]);
}
