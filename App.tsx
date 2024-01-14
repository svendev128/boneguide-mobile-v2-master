import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import { StatusBar } from "react-native";
import GlobalContext from "./contexts/GlobalContext";
import OfflineComponent from "./database/OfflineComponent";
import DrawerNavigator from "./navigation/DrawerNavigator";
import { colors } from "./utils/colors";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [offlineDataMissing, setOfflineDataMissing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCheckingLatestUpdated, setIsCheckingLatestUpdated] = useState(false);

  return (
    <>
      <GlobalContext.Provider
        value={{
          searchQuery,
          setSearchQuery,
          hospitalId,
          setHospitalId,
          projectId,
          setProjectId,
          downloading,
          setDownloading,
          offlineDataMissing,
          setOfflineDataMissing,
          isCheckingLatestUpdated,
          setIsCheckingLatestUpdated,
          checkingUpdates,
          setCheckingUpdates,
          isConnected,
          setIsConnected,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />

        {!downloading && !checkingUpdates && (
          <NavigationContainer>
            <DrawerNavigator />
          </NavigationContainer>
        )}

        <OfflineComponent />
      </GlobalContext.Provider>
    </>
  );
}
