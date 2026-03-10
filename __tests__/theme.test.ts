import { getAppTheme, resolveThemeScheme } from '../src/theme/theme';

describe('theme resolution', () => {
  test('uses system scheme when mode is system', () => {
    expect(resolveThemeScheme('dark', 'system')).toBe('dark');
    expect(resolveThemeScheme('light', 'system')).toBe('light');
  });

  test('overrides system scheme when mode is explicit', () => {
    expect(resolveThemeScheme('dark', 'light')).toBe('light');
    expect(resolveThemeScheme('light', 'dark')).toBe('dark');
  });

  test('returns correct theme tokens', () => {
    expect(getAppTheme('light').isDark).toBe(false);
    expect(getAppTheme('dark').isDark).toBe(true);
  });
});
