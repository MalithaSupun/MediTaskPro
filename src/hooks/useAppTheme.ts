import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { getAppTheme, getNavigationTheme } from '../theme/theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();

  return useMemo(() => {
    const appTheme = getAppTheme(colorScheme);

    return {
      appTheme,
      navigationTheme: getNavigationTheme(appTheme),
    };
  }, [colorScheme]);
}
