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
      color: '#374151', // gray-700
      marginBottom: 6,
    };

    const inputContainerStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: hasError ? '#ef4444' : '#d1d5db', // danger-500 or gray-300
      borderRadius: 8,
      backgroundColor: '#ffffff',
      minHeight: 48,
      paddingHorizontal: 12,
    };

    const inputStyles: TextStyle = {
      flex: 1,
      fontSize: 16,
      color: '#111827', // gray-900
      paddingVertical: 12,
    };

    const helperTextStyles: TextStyle = {
      fontSize: 12,
      marginTop: 4,
      color: hasError ? '#ef4444' : '#6b7280', // danger-500 or gray-500
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
            placeholderTextColor="#9ca3af" // gray-400
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
