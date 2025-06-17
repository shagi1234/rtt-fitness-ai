import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Info, X, ChevronDown, ChevronUp } from "lucide-react-native";
import { SvgXml } from "react-native-svg";
import {
  completedWorkoutIcon,
  missedWorkoutIcon,
  plannedWorkoutIcon,
  todayWorkoutIcon,
} from "@/lib/icon";

// Типы для календаря
type CalendarDayStatus =
  | "completed"
  | "planned"
  | "missed"
  | "active"
  | "rest"
  | null;

interface CalendarDay {
  day: number | null;
  status: CalendarDayStatus;
  date?: Date;
  isCurrentMonth?: boolean;
  workoutId?: string;
  workoutTitle?: string;
  dayTitle?: string;
  isRestDay?: boolean;
}

interface CalendarItem {
  date: string;
  title: string;
  workout_title: string;
  workout_id: string;
  trained: boolean;
  canceled: boolean;
}

interface ProgramCalendarProps {
  title?: string;
  collapsible?: boolean;
  initialCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  calendar?: CalendarItem[];
  selectedMonth?: Date;
}

const { height } = Dimensions.get("window");

// Функция для получения названия месяца
const getMonthName = (date: Date): string => {
  return date.toLocaleString("default", { month: "long" });
};

// Функция для получения дней недели
const getDaysOfWeek = (): string[] => {
  return ["M", "T", "W", "T", "F", "S", "S"];
};

// Функция для проверки, является ли дата сегодняшним днем
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
  );
};

// Функция для проверки, является ли дата прошедшей
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setFullYear(today.getFullYear());
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Функция для сравнения дат (без учета времени)
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
  );
};

// Функция для получения статуса дня на основе данных календаря
const getStatusFromCalendarItem = (
  calendarItem: CalendarItem,
  todayDate: Date
): CalendarDayStatus => {
  const itemDate = new Date(calendarItem.date);

  // Получаем день и месяц для сравнения
  const itemDay = itemDate.getDate();
  const itemMonth = itemDate.getMonth() + 1; // JavaScript месяцы от 0-11

  // Получаем текущий день и месяц для сравнения
  const today = new Date();
  const currentDay = today.getDate();
  // console.log("currentDay", currentDay);
  const currentMonth = today.getMonth() + 1;

  // Заменяем год на текущий для корректного сравнения
  const dateForCompare = new Date(calendarItem.date);
  dateForCompare.setFullYear(today.getFullYear());

  // Проверка на "сегодня" (ручное сравнение дня и месяца)
  const isDateToday =
    itemDay === currentDay &&
    (itemMonth === currentMonth || itemMonth - 12 === currentMonth);

  // 1. Проверяем дни отдыха
  if (calendarItem.title === "Rest today") {
    return "rest";
  }

  // 2. Проверяем, тренировка выполнена
  if (calendarItem.trained && !calendarItem.canceled) {
    return "completed";
  }
  // console.log("calendarItem.canceled", calendarItem.canceled);
  // 3. Проверяем, тренировка пропущена
  if (!calendarItem.trained && calendarItem.canceled) {
    return "missed";
  }

  // 4. Проверяем, сегодняшняя ли это тренировка (проверка на день и месяц)
  if (isDateToday && calendarItem.workout_id) {
    return "active";
  }

  // 5. Для будущих и прошедших тренировок определяем по номеру дня/месяца, а не по объекту Date
  // Если месяц совпадает, проверяем по дням
  if (itemMonth === currentMonth || itemMonth - 12 === currentMonth) {
    if (
      itemDay > currentDay &&
      calendarItem.workout_id &&
      !calendarItem.trained &&
      !calendarItem.canceled
    ) {
      return "planned";
    }
    if (
      itemDay < currentDay &&
      calendarItem.workout_id &&
      !calendarItem.trained &&
      !calendarItem.canceled
    ) {
      return "missed";
    }
  }
  // Если месяц больше текущего, это будущая тренировка
  else if (itemMonth > currentMonth || itemMonth - 12 > currentMonth) {
    if (
      calendarItem.workout_id &&
      !calendarItem.trained &&
      !calendarItem.canceled
    ) {
      return "planned";
    }
  }
  // Если месяц меньше текущего, это прошедшая тренировка
  else if (itemMonth < currentMonth || itemMonth - 12 < currentMonth) {
    if (
      calendarItem.workout_id &&
      !calendarItem.trained &&
      !calendarItem.canceled
    ) {
      return "missed";
    }
  }

  return null;
};

// Функция для генерации данных календаря
const generateCalendarData = (
  selectedMonth: Date,
  calendar: CalendarItem[] = []
): CalendarDay[][] => {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Первый день месяца
  const firstDayOfMonth = new Date(year, month, 1);

  // Получаем день недели для первого дня месяца
  let firstDayWeekday = firstDayOfMonth.getDay() - 1;
  if (firstDayWeekday === -1) firstDayWeekday = 6;

  // Последний день месяца
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Создаем массив для хранения недель
  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  // Создаем Map для быстрого доступа к элементам календаря
  const calendarMap = new Map<string, CalendarItem>();
  calendar.forEach((item) => {
    // Получаем день из даты в элементе календаря
    const itemDate = new Date(item.date);
    const itemDay = itemDate.getDate();
    const itemMonth = itemDate.getMonth() + 1; // +1 потому что месяцы от 0-11
    const itemYear = itemDate.getFullYear();

    // Создаем ключ в формате "YYYY-MM-DD"
    // Эта дата будет использоваться для поиска в календаре
    const serverDateKey = `${itemYear}-${itemMonth
      .toString()
      .padStart(2, "0")}-${itemDay.toString().padStart(2, "0")}`;
    calendarMap.set(serverDateKey, item);
  });

  // Добавляем дни предыдущего месяца
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  for (let i = 0; i < firstDayWeekday; i++) {
    const day = daysInPrevMonth - firstDayWeekday + i + 1;
    const date = new Date(year, month - 1, day);

    // Форматируем дату для поиска в данных сервера
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthValue = month === 0 ? 12 : month;
    const dateString = `${prevMonthYear}-${prevMonthValue
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    const calendarItem = calendarMap.get(dateString);

    let status: CalendarDayStatus = null;
    if (calendarItem) {
      status = getStatusFromCalendarItem(calendarItem, today);
    }

    week.push({
      day: null,
      status,
      date,
      isCurrentMonth: false,
      workoutId: calendarItem?.workout_id || "",
      workoutTitle: calendarItem?.workout_title || "",
      dayTitle: calendarItem?.title || "",
      isRestDay: calendarItem?.title === "Rest today" || false,
    });
  }

  // Добавляем дни текущего месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    // Форматируем дату для поиска в данных сервера
    const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    const calendarItem = calendarMap.get(dateString);

    let status: CalendarDayStatus = null;
    if (calendarItem) {
      status = getStatusFromCalendarItem(calendarItem, today);
    } else if (isToday(date)) {
      status = "active";
    }

    week.push({
      day,
      status,
      date,
      isCurrentMonth: true,
      workoutId: calendarItem?.workout_id || "",
      workoutTitle: calendarItem?.workout_title || "",
      dayTitle: calendarItem?.title || "",
      isRestDay: calendarItem?.title === "Rest today" || false,
    });

    if (week.length === 7) {
      weeks.push([...week]);
      week = [];
    }
  }

  // Добавляем дни следующего месяца только если текущая неделя не завершена
  if (week.length > 0 && week.length < 7) {
    const daysToAdd = 7 - week.length;
    for (let day = 1; day <= daysToAdd; day++) {
      const date = new Date(year, month + 1, day);

      // Форматируем дату для поиска в данных сервера
      const nextMonthYear = month === 11 ? year + 1 : year;
      const nextMonthValue = month === 11 ? 1 : month + 2;
      const dateString = `${nextMonthYear}-${nextMonthValue
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const calendarItem = calendarMap.get(dateString);

      let status: CalendarDayStatus = null;
      if (calendarItem) {
        status = getStatusFromCalendarItem(calendarItem, today);
      }

      week.push({
        day: null,
        status,
        date,
        isCurrentMonth: false,
        workoutId: calendarItem?.workout_id || "",
        workoutTitle: calendarItem?.workout_title || "",
        dayTitle: calendarItem?.title || "",
        isRestDay: calendarItem?.title === "Rest today" || false,
      });
    }
    weeks.push([...week]);
  }

  // Фильтруем календарные данные до конца текущего месяца
  const filteredWeeks = weeks.map((week) =>
    week.map((day) => {
      if (day.date && day.date.getMonth() > month) {
        return {
          ...day,
          status: null,
          workoutId: "",
          workoutTitle: "",
          dayTitle: "",
          isRestDay: false,
        };
      }
      return day;
    })
  );

  return filteredWeeks;
};

// Функция для получения данных текущей недели
const getCurrentWeekData = (calendarData: CalendarDay[][]): CalendarDay[][] => {
  const today = new Date();

  for (const week of calendarData) {
    for (const day of week) {
      if (day.date && isToday(day.date)) {
        return [week];
      }
    }
  }

  return calendarData.length > 0 ? [calendarData[0]] : [];
};

const ProgramCalendar: React.FC<ProgramCalendarProps> = ({
  title,
  collapsible = true,
  initialCollapsed = true,
  onCollapseChange,
  calendar = [],
  selectedMonth = new Date(),
}) => {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [fullCalendarData, setFullCalendarData] = useState<CalendarDay[][]>([]);
  const [currentCalendarData, setCurrentCalendarData] = useState<
    CalendarDay[][]
  >([]);

  useEffect(() => {
    const generatedData = generateCalendarData(selectedMonth, calendar);
    setFullCalendarData(generatedData);
    const currentWeekData = collapsed
      ? getCurrentWeekData(generatedData)
      : generatedData;
    setCurrentCalendarData(currentWeekData);
  }, [selectedMonth, calendar, collapsed]);

  const calendarTitle = useMemo(
    () => title || (collapsed ? "This week" : getMonthName(selectedMonth)),
    [title, collapsed, selectedMonth]
  );

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  const toggleCalendar = useCallback(() => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  }, [collapsible, collapsed]);

  const openBottomSheet = useCallback(() => {
    setBottomSheetVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const closeBottomSheet = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
    });
  }, [animation]);

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const bottomSheetTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const calendarDays = useMemo(() => getDaysOfWeek(), []);

  const renderCalendarDay = useCallback((item: CalendarDay, index: number) => {
    if (item.status) {
      if (item.status === "rest") {
        return (
          <TouchableOpacity key={index} style={styles.dayCell} disabled={true}>
            <Text style={styles.restDayText}>{item.day}</Text>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          key={index}
          style={styles.dayCell}
          onPress={() => {
            if (item.workoutId && item.workoutId !== "") {
              // router.push(`/workout/${item.workoutId}`);
            }
          }}
          disabled={!item.workoutId || item.workoutId === ""}
        >
          {item.status === "completed" && (
            <View style={styles.completedDay}>
              {completedWorkoutIcon ? (
                <SvgXml xml={completedWorkoutIcon} width={34} height={34} />
              ) : (
                <View
                  style={[
                    styles.iconPlaceholder,
                    { backgroundColor: "#E3F1EC" },
                  ]}
                />
              )}
            </View>
          )}
          {item.status === "planned" && (
            <View style={styles.plannedDay}>
              {plannedWorkoutIcon ? (
                <SvgXml xml={plannedWorkoutIcon} width={34} height={34} />
              ) : (
                <View style={styles.iconPlaceholder} />
              )}
            </View>
          )}
          {item.status === "missed" && (
            <View style={styles.missedDay}>
              {missedWorkoutIcon ? (
                <SvgXml xml={missedWorkoutIcon} width={34} height={34} />
              ) : (
                <View
                  style={[
                    styles.iconPlaceholder,
                    { backgroundColor: "#F6F6F6" },
                  ]}
                />
              )}
            </View>
          )}
          {item.status === "active" && item.workoutId && (
            <View style={styles.activeDay}>
              {todayWorkoutIcon ? (
                <SvgXml xml={todayWorkoutIcon} width={34} height={34} />
              ) : (
                <View
                  style={[
                    styles.iconPlaceholder,
                    { backgroundColor: "#00E087" },
                  ]}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View key={index} style={styles.dayCell}>
        {item.day && item.isCurrentMonth && (
          <Text
            style={[
              styles.dayNumber,
              isToday(item.date!) ? styles.todayNumber : null,
              item.date && isPastDate(new Date(item.date.getTime()))
                ? styles.pastDayNumber
                : styles.futureDayNumber,
            ]}
          >
            {item.day}
          </Text>
        )}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={toggleCalendar}
        disabled={!collapsible}
      >
        <Text style={styles.title}>{calendarTitle}</Text>
        {collapsible &&
          (collapsed ? (
            <ChevronDown size={24} color="#000000" />
          ) : (
            <ChevronUp size={24} color="#000000" />
          ))}
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.header}>
        {calendarDays.map((day, index) => (
          <Text key={index} style={styles.headerDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarContainer}>
        {currentCalendarData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => renderCalendarDay(day, dayIndex))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.marksContainer}
        onPress={openBottomSheet}
        activeOpacity={0.7}
      >
        <Info size={16} color="#666666" />
        <Text style={styles.marksText}>Marks</Text>
      </TouchableOpacity>

      <Modal
        visible={bottomSheetVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeBottomSheet}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
            onTouchEnd={closeBottomSheet}
          />
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: bottomSheetTranslateY }] },
            ]}
          >
            <View style={styles.bottomSheetIndicator} />

            <View style={styles.bottomSheetContent}>
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Marks</Text>
                <TouchableOpacity onPress={closeBottomSheet}>
                  <X size={24} color="#000000" />
                </TouchableOpacity>
              </View>

              <View style={styles.markItem}>
                <View style={styles.markIconContainer}>
                  {missedWorkoutIcon ? (
                    <SvgXml xml={missedWorkoutIcon} width={34} height={34} />
                  ) : (
                    <View
                      style={[
                        styles.iconPlaceholder,
                        { backgroundColor: "#F6F6F6" },
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.markText}>Workout missed</Text>
              </View>

              <View style={styles.markItem}>
                <View style={styles.markIconContainer}>
                  {completedWorkoutIcon ? (
                    <SvgXml xml={completedWorkoutIcon} width={34} height={34} />
                  ) : (
                    <View
                      style={[
                        styles.iconPlaceholder,
                        { backgroundColor: "#E3F1EC" },
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.markText}>Workout completed</Text>
              </View>

              <View style={styles.markItem}>
                <View style={styles.markIconContainer}>
                  <View style={styles.restDay}>
                    <Text style={styles.restDayText}>{22}</Text>
                  </View>
                </View>
                <Text style={styles.markText}>Rest Day</Text>
              </View>

              <View style={styles.markItem}>
                <View style={styles.markIconContainer}>
                  {plannedWorkoutIcon ? (
                    <SvgXml xml={plannedWorkoutIcon} width={34} height={34} />
                  ) : (
                    <View style={styles.iconPlaceholder} />
                  )}
                </View>
                <Text style={styles.markText}>Workout scheduled</Text>
              </View>

              <View style={styles.markItem}>
                <View style={styles.markIconContainer}>
                  {todayWorkoutIcon ? (
                    <SvgXml xml={todayWorkoutIcon} width={34} height={34} />
                  ) : (
                    <View
                      style={[
                        styles.iconPlaceholder,
                        { backgroundColor: "#00E087" },
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.markText}>Workout today</Text>
              </View>

              <TouchableOpacity
                style={styles.understoodButton}
                onPress={closeBottomSheet}
              >
                <Text style={styles.understoodButtonText}>Understood</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerDay: {
    width: 36,
    textAlign: "center",
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  calendarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  completedDay: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  plannedDay: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  missedDay: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDay: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E3F1EC",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
  },
  todayNumber: {
    color: "#00E087",
    fontWeight: "700",
  },
  pastDayNumber: {
    color: "rgb(114, 114, 114)",
  },
  futureDayNumber: {
    color: "rgb(1, 1, 1)",
  },
  marksContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  marksText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    maxHeight: "70%",
  },
  bottomSheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#CCCCCC",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  bottomSheetContent: {
    padding: 24,
    paddingTop: 8,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  markItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  markIconContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    fontSize: 18,
    color: "#000000",
    marginLeft: 16,
  },
  restDay: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 17,
  },
  restDayText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  understoodButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  understoodButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});

export default ProgramCalendar;
