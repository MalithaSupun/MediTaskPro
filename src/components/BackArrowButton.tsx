import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';

interface BackArrowButtonProps {
  onPress?: () => void;
  color?: string;
}

const BackArrowButton = ({ onPress, color }: BackArrowButtonProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  if (!navigation.canGoBack()) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    navigation.goBack();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={handlePress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={[styles.icon, { color: color ?? '#111827' }]}>‹</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 26,
    height: 26,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 30,
    lineHeight: 28,
    fontWeight: '600',
  },
});

export default BackArrowButton;
