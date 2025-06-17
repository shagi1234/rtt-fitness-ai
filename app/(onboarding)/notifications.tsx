import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { Button } from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import { SafeAreaView } from "react-native-safe-area-context";

// Данные для выбора времени
const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const periods = ["AM", "PM"];

// Компонент переключателя для уведомлений
const CustomSwitch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <Pressable
    onPress={() => onValueChange(!value)}
    style={[styles.switchTrack, value && styles.switchTrackActive]}
  >
    <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
  </Pressable>
);

export default function NotificationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [selectedTime, setSelectedTime] = useState({
    hour: 7, // По умолчанию 8 (индекс 7)
    minute: 0, // По умолчанию 00
    period: 1, // По умолчанию PM
  });

  const handleStart = async () => {
    // Сохраняем настройки уведомлений

    // Форматируем время для уведомлений
    const hour24 =
      selectedTime.period === 1
        ? selectedTime.hour + 1 + 12
        : selectedTime.hour + 1;

    const notificationTime = `${String(hour24).padStart(2, "0")}:${String(
      selectedTime.minute
    ).padStart(2, "0")}`;

    // Перенаправляем на страницу персонализации с передачей всех собранных данных
    router.push({
      pathname: "/(onboarding)/personalizing-plan",
      params: {
        ...params,
        allowNotifications: allowNotifications ? "true" : "false",
        notificationTime,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <View style={styles.container}>
        <ProgressBar
          currentStep={5}
          totalSteps={5}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Notifications</Text>

          {/* Переключатель уведомлений */}
          <View style={styles.notificationToggle}>
            <Text style={styles.toggleText}>Allow all notifications</Text>
            <CustomSwitch
              value={allowNotifications}
              onValueChange={setAllowNotifications}
            />
          </View>

          {/* Вопрос о времени напоминаний */}
          <Text style={styles.subtitle}>
            When you want to receive reminders about training?
          </Text>

          {/* Отображение выбранного времени */}
          <View style={styles.dateContainer}>
            <Text style={styles.selectedDateText}>
              {hours[selectedTime.hour]}:{minutes[selectedTime.minute]}{" "}
              {periods[selectedTime.period]}
            </Text>
            <View style={styles.inputLine} />
          </View>
        </View>

        <Button
          title="Start"
          onPress={handleStart}
          style={styles.buttonStyle}
        />

        {/* Пространство перед пикером */}
        <View style={styles.pickerSpacer} />

        {/* Выбор времени в стиле iOS-picker для всех платформ */}
        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTime.hour}
              onValueChange={(itemValue) =>
                setSelectedTime((prev) => ({ ...prev, hour: itemValue }))
              }
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {hours.map((hour, index) => (
                <Picker.Item
                  key={hour}
                  label={hour}
                  value={index}
                  color="#000000"
                />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedTime.minute}
              onValueChange={(itemValue) =>
                setSelectedTime((prev) => ({ ...prev, minute: itemValue }))
              }
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {minutes.map((minute, index) => (
                <Picker.Item
                  key={minute}
                  label={minute}
                  value={index}
                  color="#000000"
                />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedTime.period}
              onValueChange={(itemValue) =>
                setSelectedTime((prev) => ({ ...prev, period: itemValue }))
              }
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {periods.map((period, index) => (
                <Picker.Item
                  key={period}
                  label={period}
                  value={index}
                  color="#000000"
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  toggleText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: "#E5E5E5",
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: "#00E087",
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingVertical: 20,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  inputLine: {
    width: "80%",
    height: 1,
    backgroundColor: "#DDDDDD",
    marginTop: 10,
  },
  buttonStyle: {
    marginHorizontal: 20,
  },
  pickerSpacer: {
    height: 50,
  },
  pickerContainer: {
    height: 220,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  pickerWrapper: {
    flexDirection: "row",
    height: "100%",
  },
  picker: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  pickerItem: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "normal",
    height: 130,
  },
});
