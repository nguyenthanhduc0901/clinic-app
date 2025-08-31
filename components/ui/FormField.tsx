import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput } from './TextInput';
import { TextInputProps } from 'react-native';

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  rules?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  rules,
  leftIcon,
  rightIcon,
  ...textInputProps
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInput
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          {...textInputProps}
        />
      )}
    />
  );
}
