import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { Program } from "@/lib/api/types";
import { colors } from "@/constants/сolors";
import Card from "./Card";

// Расширяем тип colors для добавления error
const extendedColors = {
  ...colors,
  error: "#FF3B30", // Добавляем цвет ошибки
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDE_PADDING = 16; // Стандартный отступ от края экрана
// Карточка немного меньше ширины экрана
const CARD_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2; // Настраиваем ширину карточки (минус отступы и немного места для следующей)
const ITEM_WIDTH = CARD_WIDTH; // Ширина элемента списка равна ширине карточки

interface ProgramsSliderProps {
  programs: Program[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ProgramsSlider: React.FC<ProgramsSliderProps> = ({
  programs,
  isLoading,
  error,
  onRetry,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  // Функция для обработки изменения видимых элементов
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Прокрутка к программе по индексу
  const scrollToIndex = (index: number) => {
    if (flatListRef.current && programs.length > 0) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // При изменении списка программ - прокручиваем к активному
  useEffect(() => {
    if (programs.length > 0 && activeIndex >= 0) {
      setTimeout(() => {
        scrollToIndex(activeIndex);
      }, 100);
    }
  }, [programs.length]);

  const renderProgram = ({ item, index }: { item: Program; index: number }) => {
    const isActive = activeIndex === index;
    // Определяем, является ли это первым или последним элементом
    const isFirst = index === 0;
    const isLast = index === programs.length - 1;

    return (
      <View
        style={[
          styles.cardWrapper,
          isFirst && styles.firstCard,
          isLast && styles.lastCard,
        ]}
      >
        <Card
          id={item.id}
          title={item.title}
          imageUrl={item.img_url}
          type="plan"
          tags={[
            { label: item.cardio_level || "Cardio" },
            { label: item.strength_level || "Strength" },
          ]}
          stats={{
            duration: `${item.weeks} weeks`,
            bodyFocus: "Full body",
            calories: item.calories,
          }}
          isActive={isActive}
          width={CARD_WIDTH}
          onPress={() => {
            scrollToIndex(index);
            router.push({
              pathname: "/(workout)/start",
              params: {
                id: item.id,
                integration_type: "plan",
                exit_url: "/(tabs)",
              },
            });
          }}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (programs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No programs available</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={programs}
      renderItem={renderProgram}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      snapToInterval={ITEM_WIDTH + 20} // Добавляем небольшой отступ для снапшота
      snapToAlignment="start" // Выравниваем по началу, а не по центру
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialScrollIndex={0}
      getItemLayout={(data, index) => ({
        length: ITEM_WIDTH + 20, // Согласуем с snapToInterval
        offset: (ITEM_WIDTH + 20) * index, // Учитываем отступ между карточками
        index,
      })}
      pagingEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingLeft: SIDE_PADDING, // Левый отступ точно 16px
    paddingRight: SIDE_PADDING, // Правый отступ точно 16px
  },
  loadingContainer: {
    padding: 20,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: extendedColors.error,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
  },
  cardWrapper: {
    width: ITEM_WIDTH,
    marginRight: 20, // Добавляем фиксированный отступ между карточками
  },
  firstCard: {
    // Стили для первой карточки
  },
  lastCard: {
    marginRight: 0, // Убираем отступ у последней карточки
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default ProgramsSlider;
