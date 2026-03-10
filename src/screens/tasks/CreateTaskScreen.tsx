import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../../components/ScreenContainer';
import TaskForm, { type TaskFormValues } from '../../components/TaskForm';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { TaskStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTasksState } from '../../store/selectors';
import { createTask } from '../../store/tasksSlice';
import { showToast } from '../../utils/toast';

const CreateTaskScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TaskStackParamList, 'CreateTask'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const { mutating } = useAppSelector(selectTasksState);

  const handleSubmit = async (values: TaskFormValues) => {
    const resultAction = await dispatch(createTask(values));

    if (createTask.fulfilled.match(resultAction)) {
      if (resultAction.payload.infoMessage) {
        showToast(resultAction.payload.infoMessage);
      }

      navigation.goBack();
      return;
    }

    if (createTask.rejected.match(resultAction)) {
      showToast(
        t(resultAction.payload ?? 'messages.taskCreateFailed', {
          defaultValue: t('messages.taskCreateFailed'),
        }),
      );
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{t('tasks.create.title')}</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>
          {t('tasks.create.subtitle')}
        </Text>

        <TaskForm
          defaultValues={{
            title: '',
            description: '',
            priority: 'Medium',
          }}
          submitLabel={t('common.actions.saveTask')}
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
});

export default CreateTaskScreen;
