import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import {
  checkIcon,
  ucrainIcon,
  cheshIcon,
  germanyIcon,
  englishIcon,
  spanishIcon,
  frenchIcon,
  portugueseIcon,
  turkishIcon,
} from "@/lib/icon";
import Header from "@/components/Header";

type Language = {
  id: string;
  name: string;
  flagIcon: string;
};

const languages: Language[] = [
  { id: "uk", name: "Українська", flagIcon: ucrainIcon },
  { id: "cs", name: "Česky", flagIcon: cheshIcon },
  { id: "de", name: "German", flagIcon: germanyIcon },
  { id: "en", name: "English", flagIcon: englishIcon },
  { id: "es", name: "Español", flagIcon: spanishIcon },
  { id: "fr", name: "Français", flagIcon: frenchIcon },
  { id: "pt", name: "Português", flagIcon: portugueseIcon },
  { id: "tr", name: "Türkçe", flagIcon: turkishIcon },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
    // Here you would typically save the language preference
    // and update the app's locale
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <Pressable
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(item.id)}
    >
      <View style={styles.languageContent}>
        <SvgXml xml={item.flagIcon} width={24} height={24} />
        <Text style={styles.languageName}>{item.name}</Text>
      </View>
      {selectedLanguage === item.id && (
        <SvgXml xml={checkIcon} width={24} height={24} />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header showBack={true} />
      <Text style={styles.title}>Language</Text>
      <FlatList
        data={languages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
    margin: 16,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    marginLeft: 16,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#06E28A",
    borderRadius: 100,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    color: "#FFFFFF",
  },
});
