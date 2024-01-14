import React, { useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import GlobalContext from "../contexts/GlobalContext";
import actions from "../utils/Actions";
import { colors } from "../utils/colors";
import AppText from "./AppText";
import AsyncSearchInput from "./AsyncSearchInput";

export function hospitalToOption({ id, name }: any) {
  return {
    label: name,
    value: id,
  };
}

function hospitalsToOptions(items: any) {
  return items.map((item: any) => hospitalToOption(item));
}

const ChangeHospitalAlert = ({ currentHospital }: any) => {
  const [showModal, setShowModal] = useState(false);

  const { setHospitalId, setProjectId, isConnected, setIsConnected } =
    useContext(GlobalContext);

  const [hospitalVersion, setHospitalVersion] = useState<string>("");

  useEffect(() => {
    fetchVersion();
  }, [currentHospital, isConnected]);

  const fetchVersion = async () => {
    if (currentHospital && currentHospital.value) {
      const versionName = await actions.getCurrentVersionName(
        isConnected,
        currentHospital.value
      );
      setHospitalVersion(versionName);
    }
  };

  const loadOptions = async (inputValue: any, callback: any) => {
    try {
      const hospitals = await actions.searchHospitals(isConnected, inputValue);
      
      if (hospitals) {
        callback(hospitalsToOptions(hospitals));
      }
    } catch (e) {
      console.error("Error loading hospitals:", e);
    }
  };

  return (
    <>
      <Modal
        animationType={"slide"}
        transparent={false}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(false);
        }}
      >
        <View style={{ padding: 15 }}>
          <AsyncSearchInput
            placeholder="Search for a hospital..."
            loadOptions={loadOptions}
            onChange={(hospital: any) => {
              setHospitalId(hospital.value);
              setProjectId(null);
              setShowModal(false);
            }}
            onCancel={() => setShowModal(false)}
          />
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
      >
        <AppText style={styles.buttonText}>
          {currentHospital ? (
            <>
              {currentHospital.label}{" "}
              <AppText style={styles.boldVersion}>
                {hospitalVersion ? `V${hospitalVersion}` : ""}
              </AppText>
            </>
          ) : (
            "Choose a hospital"
          )}
        </AppText>

        <View style={styles.buttonChange}>
          <AppText style={styles.buttonChangeText}>Change</AppText>
          <RemixIcon name="arrow-right-line" color={colors.MAIN} size={15} />
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingLeft: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.MAIN,
    flex: 0.7,
  },
  boldVersion: {
    fontWeight: "bold",
  },
  buttonChange: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  buttonChangeText: {
    color: colors.MAIN,
    fontSize: 12,
    fontWeight: "500",
    marginRight: 5,
  },

  item: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },

  modal: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ChangeHospitalAlert;
