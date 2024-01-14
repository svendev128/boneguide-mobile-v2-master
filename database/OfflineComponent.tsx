import NetInfo from "@react-native-community/netinfo";
import { useContext, useEffect, useState } from "react";
import GlobalContext from "../contexts/GlobalContext";
import OfflineMessage from "./OfflineMessage";
import offlineService from "./service";

const OfflineComponent = () => {
  const {
    downloading,
    setDownloading,
    hospitalId,
    setOfflineDataMissing,
    isConnected,
    setIsConnected,
    checkingUpdates,
    setCheckingUpdates,
  } = useContext(GlobalContext);

  const [percentage, setPercentage] = useState<number | undefined>(undefined);

  async function syncDatabase() {
    setCheckingUpdates(true);
    const isAvailable = await offlineService.isUpdateAvailable(hospitalId);
    setCheckingUpdates(false);

    if (isAvailable) {
      setDownloading(true);
      await offlineService.sync(hospitalId, setPercentage);
      setDownloading(false);
    }
  }

  async function isMissing() {
    const isDataMissing = await offlineService.isMissing(hospitalId);
    setOfflineDataMissing(isDataMissing);
  }

  useEffect(() => {
    offlineService.init();

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hospitalId && isConnected !== null) {
      if (isConnected) {
        setOfflineDataMissing(false);
        syncDatabase();
      } else {
        isMissing();
      }
    } else {
      setOfflineDataMissing(true);
    }
  }, [hospitalId, isConnected]);

  let title = "";

  if (checkingUpdates) {
    title = "Checking updates...";
  } else if (downloading) {
    title = "Downloading updates...";
  } else {
    return null;
  }

  return (
    <OfflineMessage
      title={title}
      content={`This may take a moment`}
      percentage={percentage}
      showActivityIndicator
      isScreen
    />
  );
};

export default OfflineComponent;
