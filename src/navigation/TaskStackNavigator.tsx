import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateTaskScreen from '../screens/tasks/CreateTaskScreen';
import EditTaskScreen from '../screens/tasks/EditTaskScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import type { TaskStackParamList } from './types';

const Stack = createNativeStackNavigator<TaskStackParamList>();

const TaskStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'Create Task' }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Edit Task' }} />
    </Stack.Navigator>
  );
};

export default TaskStackNavigator;
