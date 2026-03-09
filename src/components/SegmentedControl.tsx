import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { appTheme } = useAppTheme();
  const inactiveOptionTextStyle = React.useMemo(
    () => ({ color: appTheme.colors.textSecondary }),
    [appTheme.colors.textSecondary],
  );

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: appTheme.colors.border,
          borderRadius: appTheme.radius.md,
          backgroundColor: appTheme.colors.card,
        },
      ]}
    >
      {options.map(option => {
        const isActive = option === value;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.option,
              {
                borderRadius: appTheme.radius.sm,
                backgroundColor: isActive ? appTheme.colors.primary : 'transparent',
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                isActive ? styles.optionTextActive : inactiveOptionTextStyle,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
    gap: 6,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
});

export default SegmentedControl;
