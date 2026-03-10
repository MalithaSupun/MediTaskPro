import React from 'react';
import { createBottomTabNavigator, type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import MainTabIcon from '../components/MainTabIcon';
import { useAppTheme } from '../hooks/useAppTheme';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TaskStackNavigator from './TaskStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const dashboardOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color, focused }) => (
    <MainTabIcon name="Dashboard" color={color} focused={focused} />
  ),
};

const tasksOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color, focused }) => (
    <MainTabIcon name="Tasks" color={color} focused={focused} />
  ),
};

const analyticsOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color, focused }) => (
    <MainTabIcon name="Analytics" color={color} focused={focused} />
  ),
};

const profileOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color, focused }) => (
    <MainTabIcon name="Profile" color={color} focused={focused} />
  ),
};

const MainTabNavigator = () => {
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: appTheme.colors.card,
          borderTopColor: appTheme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ ...dashboardOptions, tabBarLabel: t('tabs.dashboard', { defaultValue: 'Dashboard' }) }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskStackNavigator}
        options={{ ...tasksOptions, tabBarLabel: t('tabs.tasks', { defaultValue: 'Tasks' }) }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ ...analyticsOptions, tabBarLabel: t('tabs.analytics', { defaultValue: 'Analytics' }) }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ ...profileOptions, tabBarLabel: t('tabs.profile', { defaultValue: 'Profile' }) }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
