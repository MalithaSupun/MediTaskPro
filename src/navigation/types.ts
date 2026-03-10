import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { id: string };
  CreateTask: undefined;
  EditTask: { id: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: NavigatorScreenParams<TaskStackParamList> | undefined;
  Analytics: undefined;
  Profile: undefined;
};
