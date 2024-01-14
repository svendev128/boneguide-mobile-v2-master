import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import AppText from "../components/AppText";
import { colors } from "../utils/colors";

interface OfflineMessageProps {
  title: string;
  content: string;
  isScreen?: boolean;
  showActivityIndicator?: boolean;
  percentage?: number;
}

const OfflineMessage = ({
  title,
  content,
  isScreen,
  showActivityIndicator = false,
  percentage,
}: OfflineMessageProps) => {
  return (
    <View
      style={{
        ...styles.noDataContainer,
        ...(isScreen ? styles.noDataContainerScreen : { marginTop: 40 }),
      }}
    >
      <Image
        source={require("../assets/search-icon.png")}
        style={{
          width: 150,
          height: 150,
        }}
      />

      <AppText style={styles.noDataTitle}>{title}</AppText>

      {showActivityIndicator && (
        <>
          {percentage != undefined ? (
            <CircularProgress
              radius={40}
              value={percentage}
              activeStrokeColor={colors.MAIN}
              inActiveStrokeColor={colors.MAIN}
              inActiveStrokeOpacity={0.2}
              progressValueColor={colors.MAIN}
              valueSuffix={"%"}
              activeStrokeWidth={5}
              inActiveStrokeWidth={5}
            />
          ) : (
            <ActivityIndicator size="large" color={colors.MAIN} />
          )}
        </>
      )}

      <AppText style={styles.noDataContent}>{content}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noDataContainerScreen: {
    position: "absolute",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    top: 0,
    zIndex: 999999999999,
  },
  noDataTitle: {
    marginTop: 20,
    marginBottom: 15,
    color: "#101828",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: -0.36,
  },
  noDataContent: {
    color: "#475467",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 15,
  },
});

export default OfflineMessage;
