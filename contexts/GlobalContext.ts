import React from "react";

interface GlobalContextI {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  hospitalId: number | null;
  setHospitalId: React.Dispatch<React.SetStateAction<number | null>>;
  projectId: number | null;
  setProjectId: React.Dispatch<React.SetStateAction<number | null>>;

  downloading: boolean;
  setDownloading: React.Dispatch<React.SetStateAction<boolean>>;

  offlineDataMissing: boolean;
  setOfflineDataMissing: React.Dispatch<React.SetStateAction<boolean>>;

  isCheckingLatestUpdated: boolean;
  setIsCheckingLatestUpdated: React.Dispatch<React.SetStateAction<boolean>>;

  checkingUpdates: boolean;
  setCheckingUpdates: React.Dispatch<React.SetStateAction<boolean>>;

  isConnected: null | boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<null | boolean>>;
}

const GlobalContext = React.createContext<GlobalContextI>({
  searchQuery: "",
  setSearchQuery: () => {},
  hospitalId: null,
  setHospitalId: () => {},
  projectId: null,
  setProjectId: () => {},
  downloading: false,
  setDownloading: () => {},
  offlineDataMissing: false,
  setOfflineDataMissing: () => {},
  isCheckingLatestUpdated: false,
  setIsCheckingLatestUpdated: () => {},
  checkingUpdates: false,
  setCheckingUpdates: () => {},
  isConnected: null,
  setIsConnected: () => {},
});

export default GlobalContext;
