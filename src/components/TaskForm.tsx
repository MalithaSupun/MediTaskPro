import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useAppTheme } from '../hooks/useAppTheme';
import { TASK_PRIORITIES, type TaskPriority } from '../types/task';
import SegmentedControl from './SegmentedControl';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
}

interface TaskFormProps {
  defaultValues: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  loading?: boolean;
}

const TaskForm = ({ defaultValues, submitLabel, onSubmit, loading = false }: TaskFormProps) => {
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const taskValidationSchema: yup.ObjectSchema<TaskFormValues> = useMemo(
    () =>
      yup.object({
        title: yup
          .string()
          .trim()
          .required(t('form.validation.titleRequired'))
          .min(3, t('form.validation.titleMin'))
          .max(80, t('form.validation.titleMax')),
        description: yup
          .string()
          .trim()
          .required(t('form.validation.descriptionRequired'))
          .max(300, t('form.validation.descriptionMax')),
        dueDate: yup
          .string()
          .trim()
          .required(t('form.validation.dueDateRequired'))
          .matches(/^\d{4}-\d{2}-\d{2}$/, t('form.validation.dueDateInvalid'))
          .test('valid-calendar-date', t('form.validation.dueDateInvalid'), value => {
            if (!value) {
              return false;
            }

            const [year, month, day] = value.split('-').map(Number);
            const parsedDate = new Date(year, month - 1, day);

            return (
              parsedDate.getFullYear() === year &&
              parsedDate.getMonth() === month - 1 &&
              parsedDate.getDate() === day
            );
          }),
        priority: yup.mixed<TaskPriority>().oneOf(TASK_PRIORITIES).required(t('form.validation.priorityRequired')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues,
    resolver: yupResolver(taskValidationSchema),
    mode: 'onSubmit',
  });

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.title')}</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={t('common.placeholders.titleExample')}
            placeholderTextColor={appTheme.colors.textSecondary}
            style={[
              styles.input,
              {
                borderColor: errors.title ? appTheme.colors.danger : appTheme.colors.border,
                color: appTheme.colors.textPrimary,
                backgroundColor: appTheme.colors.card,
                borderRadius: appTheme.radius.md,
              },
            ]}
          />
        )}
      />
      {errors.title ? <Text style={[styles.errorText, { color: appTheme.colors.danger }]}>{errors.title.message}</Text> : null}

      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.description')}</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder={t('common.placeholders.descriptionExample')}
            placeholderTextColor={appTheme.colors.textSecondary}
            style={[
              styles.input,
              styles.multilineInput,
              {
                borderColor: errors.description ? appTheme.colors.danger : appTheme.colors.border,
                color: appTheme.colors.textPrimary,
                backgroundColor: appTheme.colors.card,
                borderRadius: appTheme.radius.md,
              },
            ]}
          />
        )}
      />
      {errors.description ? (
        <Text style={[styles.errorText, { color: appTheme.colors.danger }]}>{errors.description.message}</Text>
      ) : null}

      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.dueDate')}</Text>
      <Controller
        control={control}
        name="dueDate"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="numbers-and-punctuation"
            placeholder={t('common.placeholders.dueDate')}
            placeholderTextColor={appTheme.colors.textSecondary}
            maxLength={10}
            style={[
              styles.input,
              {
                borderColor: errors.dueDate ? appTheme.colors.danger : appTheme.colors.border,
                color: appTheme.colors.textPrimary,
                backgroundColor: appTheme.colors.card,
                borderRadius: appTheme.radius.md,
              },
            ]}
          />
        )}
      />
      {errors.dueDate ? (
        <Text style={[styles.errorText, { color: appTheme.colors.danger }]}>{errors.dueDate.message}</Text>
      ) : null}

      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.priority')}</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <SegmentedControl
            options={TASK_PRIORITIES}
            value={value}
            onChange={onChange}
            getLabel={option => t(`common.priority.${option.toLowerCase()}`)}
          />
        )}
      />
      {errors.priority ? (
        <Text style={[styles.errorText, { color: appTheme.colors.danger }]}>{errors.priority.message}</Text>
      ) : null}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={loading || isSubmitting}
        style={({ pressed }) => [
          styles.submitButton,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed || loading || isSubmitting ? 0.86 : 1,
          },
        ]}
      >
        {loading || isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{submitLabel}</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 112,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TaskForm;
