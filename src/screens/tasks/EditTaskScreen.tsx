import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenContainer from '../../components/ScreenContainer';
import TaskForm, { type TaskFormValues } from '../../components/TaskForm';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { TaskStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getTaskById, selectTasksState } from '../../store/selectors';
import { updateTask } from '../../store/tasksSlice';
import { showToast } from '../../utils/toast';

const EditTaskScreen = () => {
  const route = useRoute<RouteProp<TaskStackParamList, 'EditTask'>>();
  const navigation = useNavigation<NativeStackNavigationProp<TaskStackParamList, 'EditTask'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();

  const task = useAppSelector(state => getTaskById(state.tasks.tasks, route.params.id));
  const { mutating } = useAppSelector(selectTasksState);

  if (!task) {
    return (
      <ScreenContainer>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundTitle, { color: appTheme.colors.textPrimary }]}>Task is no longer available</Text>
          <Text style={[styles.notFoundSubtitle, { color: appTheme.colors.textSecondary }]}>Please return to the list and select another task.</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.notFoundButton,
              {
                borderRadius: appTheme.radius.pill,
                backgroundColor: appTheme.colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleSubmit = async (values: TaskFormValues) => {
    const resultAction = await dispatch(
      updateTask({
        id: task.id,
        changes: values,
      }),
    );

    if (updateTask.fulfilled.match(resultAction)) {
      if (resultAction.payload.infoMessage) {
        showToast(resultAction.payload.infoMessage);
      }

      navigation.goBack();
      return;
    }

    if (updateTask.rejected.match(resultAction)) {
      showToast(resultAction.payload ?? 'Failed to save task changes');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Edit Task</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Update details and keep the workflow accurate.</Text>

        <TaskForm
          key={task.id}
          defaultValues={{
            title: task.title,
            description: task.description,
            priority: task.priority,
          }}
          submitLabel="Save Changes"
          loading={mutating}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 26,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
  },
  notFoundButton: {
    minHeight: 44,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default EditTaskScreen;
