import React from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator } from "react-native";
import { contentService } from "@/lib/api/services/contentService";
import { MainPageResponse, AvailableContentResponse } from "@/lib/api/types";
import { useState, useEffect } from "react";
import { GradientWrapper } from "@/components/GradientWrapper";
import HomeScreenDefault from "@/components/HomeScreenDefault";
import { HomeScreenActive } from "@/components/HomeScreenActive";
import { colors } from "@/constants/сolors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [mainData, setMainData] = useState<MainPageResponse | null>(null);
  const [availableContent, setAvailableContent] =
    useState<AvailableContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMainDataLoading, setIsMainDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMainData();
    fetchAvailableContent();
  }, []);

  const fetchMainData = async () => {
    try {
      setIsMainDataLoading(true);
      const data = await contentService.getMainPageData();
      setMainData(data);
    } catch (err) {
      console.error("Failed to fetch main data:", err);
    } finally {
      setIsMainDataLoading(false);
    }
  };

  const fetchAvailableContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await contentService.getAvailableContent();
      setAvailableContent(content);
    } catch (err) {
      console.error("Failed to fetch available content:", err);
      setError("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAvailableContent();
  };

  // Показываем глобальный индикатор загрузки, пока загружаются основные данные
  if (isMainDataLoading) {
    return (
      <GradientWrapper
        colors={[colors.gradient.start, colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        </SafeAreaView>
      </GradientWrapper>
    );
  }

  return (
    <GradientWrapper
      colors={[colors.gradient.start, colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeAreaContainer} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          overScrollMode="never"
        >
          {mainData?.plan ? (
            <HomeScreenActive
              plan={mainData.plan[0]}
              workout={mainData.workout?.[0]}
              availablePrograms={availableContent?.plans || []}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
          ) : (
            <HomeScreenDefault
              programs={availableContent?.plans || []}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
