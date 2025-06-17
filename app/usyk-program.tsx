import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { GradientWrapper } from "../components/GradientWrapper";
import { Button } from "../components/Button";
import { contentService } from "@/lib/api/services/contentService";

export default function UsykProgram() {
  const router = useRouter();
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
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require("../assets/images/usyk1.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        {/* Top bar: time and close */}
        <View style={styles.topBar}>
          <Text style={styles.timeText}></Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <View style={styles.closeCircle}>
              <Text style={styles.closeText}>×</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Bottom overlay with gradient */}
        <GradientWrapper
          colors={["rgba(0,0,0,0.001)", "rgb(0, 0, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomOverlay}
        >
          <View style={styles.titleRow}>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>$ 4.99</Text>
            </View>
          </View>
          <Text style={styles.title}>Training with the champion!</Text>
          <Text style={styles.subtitle}>20 workouts from Oleksandr Usyk</Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Get the program for $4.99"
              onPress={handleGetProgram}
              style={styles.getProgramButton}
            />
          </View>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => router.push("/usyk-program-details")}
          >
            <Text style={styles.learnMoreButtonText}>Learn more</Text>
          </TouchableOpacity>
        </GradientWrapper>
      </ImageBackground>

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
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalButtonText}>✕</Text>
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
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "android" ? 42 : 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  timeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  closeButton: {
    marginLeft: 12,
  },
  closeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#222",
    fontSize: 32,
    fontWeight: "400",
    lineHeight: 36,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  priceTag: {
    backgroundColor: "#19C37D",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  priceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "left",
    width: "100%",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 32,
    textAlign: "left",
    width: "100%",
  },
  getProgramButton: {
    // borderRadius: 16,
    // paddingVertical: 18,
    // width: "100%",

    alignItems: "center",
    marginBottom: 8,
  },
  getProgramButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonContainer: {
    width: "100%",
  },
  learnMoreButton: {
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
    // paddingVertical: 18,
    height: 44,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  learnMoreButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
  closeModalButton: {
    padding: 5,
  },
  closeModalButtonText: {
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
