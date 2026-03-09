import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as yup from 'yup';

import { useAppTheme } from '../hooks/useAppTheme';
import { TASK_PRIORITIES, type TaskPriority } from '../types/task';
import SegmentedControl from './SegmentedControl';

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
}

const taskValidationSchema: yup.ObjectSchema<TaskFormValues> = yup.object({
  title: yup.string().trim().required('Title is required').min(3, 'Title must be at least 3 characters').max(80, 'Title can have up to 80 characters'),
  description: yup.string().trim().required('Description is required').max(300, 'Description can have up to 300 characters'),
  priority: yup.mixed<TaskPriority>().oneOf(TASK_PRIORITIES).required('Priority is required'),
});

interface TaskFormProps {
  defaultValues: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  loading?: boolean;
}

const TaskForm = ({ defaultValues, submitLabel, onSubmit, loading = false }: TaskFormProps) => {
  const { appTheme } = useAppTheme();

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
      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Title</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Patient report follow-up"
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

      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Description</Text>
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
            placeholder="Add context, patient notes, and follow-up details"
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

      <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Priority</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <SegmentedControl options={TASK_PRIORITIES} value={value} onChange={onChange} />
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
