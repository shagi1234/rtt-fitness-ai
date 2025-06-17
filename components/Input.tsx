import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  touched,
  isPassword,
  style,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (isPassword) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.passwordContainer,
            touched && error ? styles.inputError : null,
          ]}
        >
          <TextInput
            {...props}
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999999"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </Pressable>
        </View>
        {touched && error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          touched && error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor="#999999"
      />
      {touched && error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  input: {
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgb(221, 223, 228)",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 4,
  },
  passwordContainer: {
    borderWidth: 1,
    borderColor: "rgb(221, 223, 228)",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 18,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
});
