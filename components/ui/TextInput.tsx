import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../utils/theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  style?: StyleProp<TextStyle>;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      style,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const containerStyles: ViewStyle = {
      marginBottom: 16,
      ...containerStyle,
    };

    const labelStyles: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
      marginBottom: 6,
    };

    const inputContainerStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: hasError ? theme.colors.danger : theme.colors.borderMuted,
      borderRadius: 8,
      backgroundColor: theme.colors.bg,
      minHeight: 48,
      paddingHorizontal: 12,
    };

    const inputStyles: TextStyle = {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 12,
    };

    const helperTextStyles: TextStyle = {
      fontSize: 12,
      marginTop: 4,
      color: hasError ? theme.colors.danger : theme.colors.textMuted,
    };

    const iconMargin = 8;

    return (
      <View style={containerStyles}>
        {label && <Text style={labelStyles}>{label}</Text>}
        
        <View style={inputContainerStyles}>
          {leftIcon && <View style={{ marginRight: iconMargin }}>{leftIcon}</View>}
          
          <RNTextInput
            ref={ref}
            style={[inputStyles, style]}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          
          {rightIcon && <View style={{ marginLeft: iconMargin }}>{rightIcon}</View>}
        </View>

        {(error || helperText) && (
          <Text style={helperTextStyles}>{error || helperText}</Text>
        )}
      </View>
    );
  }
);
