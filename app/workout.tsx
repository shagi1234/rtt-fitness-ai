import type React from "react";
import { router, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import KinestexSDK from "kinestex-sdk-react-native";
import {
  IntegrationOption,
  IPostData,
  KinesteXSDKCamera,
  Lifestyle,
} from "kinestex-sdk-react-native/src/types";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const postData: IPostData = {
  key: "a1d47db9e8087ab6c3e1b120faaa7058", // your API key
  userId: "YOUR USER ID", // your unique user identifier. Can be any string, but must be unique for each user.
  company: "Ready to Fight", // your company name
};

export default function TestWorkout() {
  const kinestexSDKRef = useRef<KinesteXSDKCamera>(null);

  const handleMessage = (type: string, data: { [key: string]: any }) => {
    switch (type) {
      case "exit_kinestex":
        console.log("User wishes to exit the app");
        router.back();
        if (data.message) {
          console.log("Date:", data.message);
        }
        break;
      case "plan_unlocked":
        console.log("Workout plan unlocked:", data);
        break;
      // All other message types (see below in Data Points section)
      default:
        console.log("Other message type:", type, data);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KinestexSDK
        ref={kinestexSDKRef}
        data={postData} // pass the postData as props
        integrationOption={IntegrationOption.WORKOUT} // Select MAIN integration option
        workout={"fitnesslite"}
        handleMessage={handleMessage} // pass message handler function through props too
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
