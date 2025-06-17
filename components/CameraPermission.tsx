import { View, Text, StyleSheet, Pressable } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";

interface CameraPermissionProps {
  onPermissionGranted: () => void;
}

export default function CameraPermission({
  onPermissionGranted,
}: CameraPermissionProps) {
  const [_, requestPermission] = useCameraPermissions();

  const handleRequestPermission = async () => {
    const permissionResult = await requestPermission();
    if (permissionResult.granted) {
      onPermissionGranted();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.message}>
          FitMentor Ai needs access to your camera to track your workouts and
          analyze your form.
        </Text>
        <Pressable onPress={handleRequestPermission}>
          <LinearGradient
            colors={["#06E28A", "#048050"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 17,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
