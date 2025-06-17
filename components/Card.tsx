import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SvgXml } from "react-native-svg";
import { Image } from "expo-image";
import { GradientWrapper } from "./GradientWrapper";
import { cardioIcon, strengthIcon } from "@/lib/icon";
import { colors } from "@/constants/сolors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_CARD_WIDTH = Math.max(SCREEN_WIDTH - 32, 343);

export type CardType = "plan" | "workout";

export interface CardTag {
  label: string;
  icon?: string;
}

export interface CardProps {
  id: string;
  title: string;
  imageUrl: string;
  type: CardType;
  isActive?: boolean;
  tags?: CardTag[];
  stats?: {
    duration?: string | number;
    calories?: string | number;
    level?: string;
    bodyFocus?: string;
  };
  showStartButton?: boolean;
  onPress?: () => void;
  onStartPress?: () => void;
  style?: any;
  width?: number;
  height?: number;
}

// Компонент тега с иконкой или без
const Tag = ({ label, icon }: CardTag) => {
  // Выбор иконки в зависимости от метки
  const getIcon = () => {
    if (icon) {
      return <SvgXml xml={icon} width={14} height={14} />;
    }
    if (label.toLowerCase().includes("cardio")) {
      return <SvgXml xml={cardioIcon} width={14} height={14} />;
    } else if (
      label.toLowerCase().includes("strenght") ||
      label.toLowerCase().includes("strength")
    ) {
      return <SvgXml xml={strengthIcon} width={14} height={14} />;
    }
    return null;
  };

  return (
    <View style={styles.tag}>
      {getIcon()}
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
};

export const Card: React.FC<CardProps> = ({
  id,
  title,
  imageUrl,
  type,
  isActive = true,
  tags = [],
  stats = {},
  showStartButton = false,
  onPress,
  onStartPress,
  style,
  width = DEFAULT_CARD_WIDTH,
  height,
}) => {
  // Устанавливаем высоту карточки в зависимости от типа (если не передана вручную)
  const cardHeight = height || (type === "plan" ? width * 0.6 : width * 0.55);

  // Анимация активного состояния (для слайдеров)
  const scale = useSharedValue(isActive ? 1 : 0.92);
  const opacity = useSharedValue(isActive ? 1 : 0.7);

  React.useEffect(() => {
    scale.value = withTiming(isActive ? 1 : 0.92, { duration: 300 });
    opacity.value = withTiming(isActive ? 1 : 0.7, { duration: 300 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Обработчик нажатия на кнопку Start и на всю карточку
  const handleStartPress = () => {
    if (onStartPress) {
      onStartPress();
      return;
    }

    if (onPress) {
      onPress();
      return;
    }

    if (type === "workout") {
      router.push({
        pathname: "/(workout)/start",
        params: {
          title: title.toLowerCase().trim(),
          integration_type: "workout",
          exit_url: "/(tabs)",
          id: id,
        },
      });
    } else {
      router.push({
        pathname: "/(workout)/start",
        params: {
          id: id,
          integration_type: "plan",
          exit_url: "/(tabs)",
        },
      });
    }
  };

  // Проверка, является ли это днем отдыха
  const isRestDay = title === "Rest Day";

  // Форматирование статистики
  const renderStats = () => {
    const statsArray = [];

    if (stats.duration) {
      statsArray.push(stats.duration);
    }

    if (stats.bodyFocus) {
      statsArray.push(stats.bodyFocus);
    }

    if (stats.level) {
      statsArray.push(stats.level);
    }

    if (stats.calories) {
      statsArray.push(`${stats.calories} kcal`);
    }

    return statsArray.map((stat, index) => (
      <React.Fragment key={index}>
        {index > 0 && <Text style={styles.metaSeparator}>•</Text>}
        <Text style={styles.metaText}>{stat}</Text>
      </React.Fragment>
    ));
  };

  return (
    <Animated.View style={[animatedStyle, { width }]}>
      <TouchableOpacity
        style={[
          styles.cardContainer,
          type === "plan" ? styles.planCard : styles.workoutCard,
          { width, height: cardHeight },
          style,
        ]}
        onPress={isRestDay ? undefined : handleStartPress}
        activeOpacity={isRestDay ? 1 : 0.9}
      >
        <ImageBackground
          source={
            title === "Rest Day"
              ? require("../assets/images/rest-day.png")
              : { uri: imageUrl }
          }
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {/* Теги в верхней части карточки */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <Tag key={index} label={tag.label} icon={tag.icon} />
              ))}
            </View>
          )}

          {/* Затемнение на заднем фоне для лучшей читаемости текста */}
          <View style={styles.gradientOverlay} />

          {/* Информация о карточке */}
          <View
            style={[
              styles.cardContent,
              type === "workout" && styles.workoutCardContent,
            ]}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.titleText}>{title}</Text>
              <View style={styles.statsContainer}>{renderStats()}</View>
            </View>

            {/* Кнопка Start (опционально) */}
            {showStartButton && !isRestDay && (
              <GradientWrapper
                style={styles.startButton}
                onPress={handleStartPress}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </GradientWrapper>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 24,
  },
  workoutCard: {
    borderRadius: 16,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  backgroundImageStyle: {
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    zIndex: 1,
    alignSelf: "flex-end",
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.black,
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  workoutCardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  infoContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    color: colors.white,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
  },
  metaSeparator: {
    color: colors.white,
    fontSize: 12,
    marginHorizontal: 8,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
});

export default Card;
