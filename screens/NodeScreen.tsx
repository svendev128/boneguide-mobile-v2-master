import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import BackBtn from "../components/BackBtn";
import Breadcrumb from "../components/Breadcrumb";
import Loading from "../components/Loading";
import NodeView from "../components/NodeView";
import Screen from "../components/Screen";
import GlobalContext from "../contexts/GlobalContext";
import actions from "../utils/Actions";

function toBreadCrumb(data: any[]): any[] {
  return data.map((item) => ({
    screen: "NodeScreen",
    text: item.title,
    parameters: { nodeId: item.id },
  }));
}

const NodeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();

  const [loading, setLoading] = useState<boolean>(true);

  const nodeId = route.params.nodeId;

  const { isConnected } = useContext(GlobalContext);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [children, setChildren] = useState<string[]>([]);
  const [content, setContent] = useState();
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { maintenanceMode, node, breadcrumb } = await actions.getNode(
        isConnected,
        nodeId
      );

      if (maintenanceMode) {
        setIsMaintenanceMode(true);
      } else {
        if (node.content) setContent(JSON.parse(`${node.content}`));
        setBreadcrumb(toBreadCrumb(breadcrumb));
        setChildren(node.childNodes);
      }
    } catch (e) {
      Alert.alert('Error loading data');
      console.log('NodeScreen error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected !== null) {
      loadData();
    }
  }, [isConnected]);

  return (
    <Screen>
      {loading ? (
        <Loading />
      ) : (
        <>
          <BackBtn />

          <Breadcrumb links={breadcrumb} />

          <NodeView
            isMaintenanceMode={isMaintenanceMode}
            children={children}
            content={content}
          />
        </>
      )}
    </Screen>
  );
};

export default NodeScreen;
