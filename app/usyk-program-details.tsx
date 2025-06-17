import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Button } from "../components/Button";
import { SvgXml } from "react-native-svg";
import { icon1, icon2, icon3, icon4 } from "../lib/icon";
import { router } from "expo-router";
import { contentService } from "@/lib/api/services/contentService";

export default function UsykProgramDetails() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleGetProgram = async () => {
    try {
      await contentService.getPaymentButton();
      setModalVisible(true);
    } catch (error) {
      console.error("Error getting payment button:", error);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topImageWrapper}>
          <Image
            source={require("../assets/images/usyk2.png")}
            style={styles.topImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.mainCard}>
          <Text style={styles.title}>Training with the champion!</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>20</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.divider}></View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1020 kcal</Text>
              <Text style={styles.statLabel}>Calorie</Text>
            </View>
            <View style={styles.divider}></View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$4.99</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>
          <View style={styles.descriptionBox}>
            <Image
              source={require("../assets/images/body.png")}
              style={styles.bodyImage}
              resizeMode="contain"
            />
            <Text style={styles.descriptionText}>
              Transform your body with the program from world boxing champion
              Oleksandr Usyk! Designed for those looking to sculpt enhance their
              physique, this dynamic plan combines training with cardio
              exercises to push your limits and maximize results.
            </Text>
          </View>
          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Program Details:</Text>
            <View style={styles.detailRow}>
              <SvgXml
                xml={icon1}
                width={24}
                height={24}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>At home/outdoors</Text>
            </View>
            <View style={styles.detailRow}>
              <SvgXml
                xml={icon2}
                width={24}
                height={24}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>Equipment optional</Text>
            </View>
            <View style={styles.detailRow}>
              <SvgXml
                xml={icon3}
                width={24}
                height={24}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>15-20 min/day</Text>
            </View>
            <View style={styles.detailRow}>
              <SvgXml
                xml={icon4}
                width={24}
                height={24}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>30 days</Text>
            </View>
          </View>
          <Button
            title="Get the program for $4.99"
            onPress={handleGetProgram}
            style={styles.button}
          />
        </View>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>We are almost ready!</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Thank you for your interest in this feature. It will be available
              very soon, and we'll be sure to let you know when it goes live.
            </Text>
            <Button
              title="To main"
              onPress={handleCloseModal}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: "#F6F6F6",
  },
  topImageWrapper: {
    width: "100%",
    height: 350,
    backgroundColor: "#F6F6F6",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    zIndex: 1,
  },
  topImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mainCard: {
    marginTop: -100,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    minHeight: 600,
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
    marginBottom: 24,
    textAlign: "left",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    // backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: "#DDDDDD",
    alignSelf: "center",
  },
  descriptionBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  bodyImage: {
    width: 90,
    height: "100%",
    marginRight: 16,
    borderRadius: 16,
    // backgroundColor: "#E9E9E9",
  },
  descriptionText: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "400",
    textAlign: "left",
  },
  detailsBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#222",
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: "#888",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginTop: 12,
    marginBottom: 30,
    lineHeight: 24,
  },
  modalButton: {
    borderRadius: 16,
    backgroundColor: "#00A86B",
  },
});
