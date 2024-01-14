import * as FileSystem from "expo-file-system";
import { startActivityAsync } from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import mime from "mime";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import AppText from "./AppText";

type OpenURLButtonProps = {
  url: string;
  children: any;
  style?: any;
};

const OpenURLButton = ({ url, children, style }: OpenURLButtonProps) => {
  const displayLocalFile = (url: string) => {
    Platform.OS == "ios" ? iosWebView(url) : androidfileView(url);
  };

  const androidfileView = async (url: string) => {
    let content = await FileSystem.getContentUriAsync(url);

    try {
      const mimeType = mime.getType(url);

      startActivityAsync("android.intent.action.VIEW", {
        data: content,
        flags: 1,
        type: mimeType || undefined,
      });
    } catch (e) {
      console.log("[ERROR] Intent launcher ", JSON.stringify(e));
      Alert.alert(`Cannot open this file`);
    }
  };

  const iosWebView = (url: string) => {
    return <WebViewComponent url={url} />;
  };

  const WebViewComponent = ({ url }: any) => {
    const shareDoc = async () => {
      try {
        Sharing.shareAsync(
          url
          // {
          //   mimeType: res.mimeType!,
          //   UTI: res.mimeType!,
          // }
        );
      } catch (e) {
        console.log("[ERROR] docuement", JSON.stringify(e));
      }
    };

    return (
      <View style={{ flex: 1 }}>
        <Pressable onPress={() => shareDoc()}>
          <AppText>Share</AppText>
        </Pressable>
        <WebView
          style={{ flex: 1 }}
          source={{ uri: url }}
          scalesPageToFit={true}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator color="black" size="large" />}
        />
      </View>
    );
  };

  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      if (url.startsWith("file://")) {
        displayLocalFile(url);
      } else {
        await Linking.openURL(url);
      }
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      {children}
    </TouchableOpacity>
  );
};

export default OpenURLButton;
