import React from 'react';
import { StyleSheet, View } from 'react-native';

type MainTabIconName = 'Dashboard' | 'Tasks' | 'Analytics' | 'Profile';

interface MainTabIconProps {
  name: MainTabIconName;
  color: string;
  focused: boolean;
}

const MainTabIcon = ({ name, color, focused }: MainTabIconProps) => {
  const activeColorStyle = { backgroundColor: color };
  const activeBorderStyle = { borderColor: color };
  const iconOpacityStyle = { opacity: focused ? 1 : 0.92 };

  if (name === 'Dashboard') {
    return (
      <View style={[styles.iconFrame, iconOpacityStyle]}>
        <View style={styles.gridRow}>
          <View style={[styles.gridCell, activeColorStyle]} />
          <View style={[styles.gridCell, activeColorStyle]} />
        </View>
        <View style={styles.gridRow}>
          <View style={[styles.gridCell, activeColorStyle]} />
          <View style={[styles.gridCell, activeColorStyle]} />
        </View>
      </View>
    );
  }

  if (name === 'Tasks') {
    return (
      <View style={[styles.iconFrame, iconOpacityStyle]}>
        <View style={[styles.clipboardBody, activeBorderStyle]}>
          <View style={[styles.clipboardLine, activeColorStyle]} />
          <View style={[styles.clipboardLine, activeColorStyle]} />
        </View>
        <View style={[styles.clipboardTop, activeColorStyle]} />
      </View>
    );
  }

  if (name === 'Analytics') {
    return (
      <View style={[styles.iconFrame, iconOpacityStyle]}>
        <View style={styles.chartBars}>
          <View style={[styles.chartBarSmall, activeColorStyle]} />
          <View style={[styles.chartBarMedium, activeColorStyle]} />
          <View style={[styles.chartBarTall, activeColorStyle]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.iconFrame, iconOpacityStyle]}>
      <View style={[styles.profileHead, activeBorderStyle]} />
      <View style={[styles.profileBody, activeBorderStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconFrame: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  gridCell: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
  clipboardBody: {
    width: 14,
    height: 14,
    borderWidth: 1.6,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  clipboardTop: {
    width: 7,
    height: 3,
    borderRadius: 2,
    position: 'absolute',
    top: 2,
  },
  clipboardLine: {
    width: 8,
    height: 1.5,
    borderRadius: 1,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  chartBarSmall: {
    width: 4,
    height: 6,
    borderRadius: 2,
  },
  chartBarMedium: {
    width: 4,
    height: 10,
    borderRadius: 2,
  },
  chartBarTall: {
    width: 4,
    height: 14,
    borderRadius: 2,
  },
  profileHead: {
    width: 7,
    height: 7,
    borderWidth: 1.6,
    borderRadius: 4,
    marginBottom: 2,
  },
  profileBody: {
    width: 12,
    height: 7,
    borderWidth: 1.6,
    borderRadius: 4,
  },
});

export default MainTabIcon;
