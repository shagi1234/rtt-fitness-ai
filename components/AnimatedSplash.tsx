import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

const FINAL_TEXT = "FitMentor AI";
const ANIMATION_DELAY = 100;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Компонент для отдельной градиентной буквы
const GradientLetter = ({ letter }: { letter: string }) => {
  if (!letter || letter === " ") {
    // Пробел или пустая строка
    return <View style={{ width: 8 }} />;
  }

  // Задаем индивидуальную ширину для каждой буквы
  let letterWidth = 15; // для всех остальных символов

  // Узкие буквы
  if (letter === "I" || letter === "i") letterWidth = 8;

  // Буквы средней ширины
  if (letter === "E" || letter === "e") letterWidth = 12;
  if (letter === "A" || letter === "a") letterWidth = 13;
  if (letter === "D" || letter === "d") letterWidth = 14;
  if (letter === "R" || letter === "r") letterWidth = 13;
  if (letter === "Y" || letter === "y") letterWidth = 14;
  if (letter === "T" || letter === "t") letterWidth = 12;
  if (letter === "O" || letter === "o") letterWidth = 12;
  if (letter === "N" || letter === "n") letterWidth = 15;
  if (letter === "G" || letter === "g") letterWidth = 15;

  // Широкие буквы
  if (letter === "M" || letter === "m") letterWidth = 20;
  if (letter === "W" || letter === "w") letterWidth = 20;

  return (
    <MaskedView
      style={{
        height: 32,
        width: letterWidth,
        // marginHorizontal: -0.5,
      }}
      maskElement={
        <Text style={[styles.letterText, { letterSpacing: 0 }]}>{letter}</Text>
      }
    >
      <LinearGradient
        colors={["#00E389", "#00A15F"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </MaskedView>
  );
};

export default function AnimatedSplash({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Добавляем буквы одну за другой
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      if (currentIndex <= FINAL_TEXT.length) {
        setDisplayedText(FINAL_TEXT.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
        // Когда все буквы появились, ждем 1 секунду и завершаем
        setTimeout(onComplete, 1000);
      }
    }, ANIMATION_DELAY);

    return () => clearInterval(textInterval);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.letterContainer}>
            {/* Рендерим каждую букву отдельно с градиентом */}
            {displayedText.split("").map((letter, index) => (
              <GradientLetter key={index} letter={letter} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  icon: {
    width: 32,
    height: 32,
  },
  letterContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
  },
  letterText: {
    fontSize: 28,
    fontFamily: "DINCondensed-DemiBold",
    color: "black",
    includeFontPadding: false,
  },
});
