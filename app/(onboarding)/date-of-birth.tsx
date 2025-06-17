import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { Button } from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export default function DateOfBirthScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(8); // September
  const [selectedDay, setSelectedDay] = useState(16); // 17
  const [selectedYear, setSelectedYear] = useState(21); // 2021

  const handleNext = () => {
    // Формируем объект даты и преобразуем его в строку формата ISO
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - selectedYear;
    const birthMonth = selectedMonth + 1; // Месяцы в JS начинаются с 0
    const birthDay = selectedDay + 1; // Дни в массиве начинаются с 0

    // Форматируем дату в формате YYYY-MM-DD
    const formattedDate = `${birthYear}-${String(birthMonth).padStart(
      2,
      "0"
    )}-${String(birthDay).padStart(2, "0")}`;

    // Вычисляем возраст
    const today = new Date();
    const birthDate = new Date(birthYear, selectedMonth, selectedDay + 1);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Переходим на следующую страницу с передачей данных
    router.push({
      pathname: "/(onboarding)/height",
      params: {
        dob: formattedDate,
        age: age.toString(),
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
          currentStep={1}
          totalSteps={5}
          onBack={() => router.back()}
          showBackButton={true}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Date of birth</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.handIcon}>👆</Text>
            </View>
            <Text style={styles.infoText}>
              Older people tend to have more body fat than younger people.
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <View style={styles.inputLine} />
          </View>
        </View>
        <Button title="Next" onPress={handleNext} style={styles.buttonStyle} />

        <View style={styles.pickerSpacer} />

        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              testID="monthPicker"
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {months.map((month, index) => (
                <Picker.Item
                  key={month}
                  label={month}
                  value={index}
                  color="#000000"
                />
              ))}
            </Picker>
            <Picker
              testID="dayPicker"
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {days.map((day, index) => (
                <Picker.Item
                  key={day}
                  label={day}
                  value={index}
                  color="#000000"
                />
              ))}
            </Picker>
            <Picker
              testID="yearPicker"
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              style={styles.picker}
              itemStyle={Platform.OS === "ios" ? styles.pickerItem : null}
            >
              {years.map((year, index) => (
                <Picker.Item
                  key={year}
                  label={year}
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
  infoContainer: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  handIcon: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "400",
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingVertical: 20,
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
