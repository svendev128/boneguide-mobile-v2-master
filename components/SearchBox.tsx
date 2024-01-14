import React, { useContext, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import GlobalContext from "../contexts/GlobalContext";
import offlineService from "../database/service";
import NodeElement from "../models/NodeElement";
import actions from "../utils/Actions";
import { callEndpoint } from "../utils/api";
import useDebounce from "../utils/useDebounce";
import AppList from "./AppList";
import AppTextInput from "./AppTextInput";
import BackBtn from "./BackBtn";
import MenuItem from "./MenuItem";

interface SearchBoxProps {
  currentHospital: any;
  hideSearch?: boolean;
}

const SearchBox = ({ currentHospital, hideSearch = false }: SearchBoxProps) => {
  const [v, setV] = useState("");
  const { isConnected } = useContext(GlobalContext);

  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<NodeElement[]>([]);

  const loadHospitalsFromSQLite = async (query: string) => {
    try {
      setLoading(true);
      const hospitals = await offlineService.searchHospitals(query);
      setSearchData(hospitals);
    } catch (error) {
      console.error("Error loading hospitals from SQLite:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitalsFromAPI = async (query: string) => {
    try {
      setLoading(true);
      const { data } = await callEndpoint({
        endpoint: `projects/hospital/${currentHospital.id}?q=${query}`,
      });
      setSearchData(data);
    } catch (error) {
      console.error("Error loading hospitals from API:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (query: string) => {
    if (!currentHospital) return;

    if (!query) {
      setSearching(false);
      setSearchData([]);
      return;
    }

    setSearching(true);

    try {
      setLoading(true);
      const hospitals = await actions.searchHospitals(isConnected, query);
      setSearchData(hospitals);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useDebounce(
    () => {
      loadData(v);
    },
    [v],
    300
  );

  return (
    <>
      <Modal
        animationType={"slide"}
        transparent={false}
        visible={searching}
        onRequestClose={() => {}}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AppTextInput
                  placeholder="Search"
                  icon="search-line"
                  value={v}
                  onChangeText={(text: string) => setV(text)}
                  autoFocus
                />

                <TouchableOpacity
                  style={{ marginLeft: 10, marginBottom: 18 }}
                  onPress={() => setSearching(false)}
                >
                  <RemixIcon name="close-line" />
                </TouchableOpacity>
              </View>
            </View>

            <AppList
              data={searchData}
              renderItem={(item: NodeElement) => {
                return <MenuItem nodeElement={item} />;
              }}
              noDataContent={`Sorry, the keyword you entered cannot be found, please check again or search with another keyword.`}
              loading={loading}
            />
          </View>
        </ScrollView>
      </Modal>

      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <BackBtn />

          {!hideSearch && (
            <AppTextInput
              placeholder="Search"
              icon="search-line"
              value={v}
              onChangeText={(text: string) => setV(text)}
            />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default SearchBox;
