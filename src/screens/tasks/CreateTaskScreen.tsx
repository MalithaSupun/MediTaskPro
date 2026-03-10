import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import BackArrowButton from '../../components/BackArrowButton';
import ScreenContainer from '../../components/ScreenContainer';
import TaskForm, { type TaskFormValues } from '../../components/TaskForm';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { TaskStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTasksState } from '../../store/selectors';
import { createTask } from '../../store/tasksSlice';
import { toLocalDateInputValue } from '../../utils/dateTime';
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
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { padding: appTheme.spacing.lg },
        ]}
      >
        <View style={styles.headerRow}>
          <BackArrowButton color={appTheme.colors.textPrimary} />
          <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{t('tasks.create.title')}</Text>
        </View>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>
          {t('tasks.create.subtitle')}
        </Text>

        <TaskForm
          defaultValues={{
            title: '',
            description: '',
            dueDate: toLocalDateInputValue(new Date()),
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default CreateTaskScreen;
