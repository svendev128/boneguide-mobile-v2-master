import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import ChangeHospitalAlert, {
  hospitalToOption,
} from "../components/ChangeHospitalAlert";
import Loading from "../components/Loading";
import NoData from "../components/NoData";
import Screen from "../components/Screen";
import Switcher from "../components/Switcher";
import TopicComponent from "../components/TopicComponent";
import SkeletonsPanel from "../components/skeleton/SkeletonsPanel";
import GlobalContext from "../contexts/GlobalContext";
import OfflineMessage from "../database/OfflineMessage";
import actions from "../utils/Actions";

const _colors = [
  "#FF7E87",
  "#A8008D",
  "#6BF0D8",
  "#F1C232",
  "#FF9781",
  "#00E3FF",
];

const LandingScreen = () => {
  const [loading, setLoading] = useState(true);

  const {
    offlineDataMissing,

    searchQuery: searchValue,
    hospitalId,
    setHospitalId,
    projectId,
    setProjectId,
    isConnected,
  } = useContext(GlobalContext);

  const [currentHospital, setCurrentHospital] = useState<any>();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>();

  const [nodes, setNodes] = useState<any>([]);

  const loadHospital = async () => {
    if (isConnected == null) return;

    try {
      if (!hospitalId) {
        const { hospital, project }: any = await actions.getDefaultHospital(
          isConnected
        );

        setHospitalId(hospital.id);
        setProjectId(project.id);
      } else if (!projectId) {
        const data = await actions.getDefaultProject(isConnected, hospitalId);
        setProjectId(data.id);
      } else {
        const hospital = await actions.getHospital(isConnected, hospitalId);
        setCurrentHospital(hospitalToOption(hospital));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!currentHospital) return;
    setLoading(true);

    try {
      if (currentHospital && currentHospital.value) {
        const projects = await actions.getHospitalNodes(
          isConnected,
          currentHospital.value
        );

        setProjects(projects);
        if (projects.length > 0) {
          setCurrentProject(projects.find((i: any) => i.id == projectId));
        }
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadNodes = async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      const nodes = await actions.getNodes(isConnected, projectId, searchValue);

      setNodes(nodes);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentHospital, isConnected, hospitalId, projectId]);

  useEffect(() => {
    loadHospital();
  }, [hospitalId, projectId, isConnected]);

  useEffect(() => {
    loadNodes();
  }, [searchValue, isConnected, projectId, currentHospital]);

  return (
    <Screen innerStyle={{ paddingBottom: 0 }} showFooter>
      <View style={{ flex: 1 }}>
        {/* choose hospital */}
        <View style={{ marginBottom: 10 }}>
          <ChangeHospitalAlert currentHospital={currentHospital} />
        </View>

        {!isConnected && offlineDataMissing && (
          <OfflineMessage
            title={`Missing Update!`}
            content={`Connect online to download latest fracture guidelines for seamsless offline use`}
          />
        )}

        {!offlineDataMissing && (
          <>
            {/* choose project */}
            <View style={{ marginTop: 10 }}>
              <Switcher
                data={[
                  ...projects.map((p: any) => ({
                    id: p.id,
                    text: p.title,
                  })),
                ]}
                currentId={projectId}
                onSwitch={(id: any) => {
                  setProjectId(id);
                }}
                disabled={loading}
              />
            </View>

            {/* nodes */}
            {loading ? (
              <Loading />
            ) : (
              <>
                {nodes.length > 0 ? (
                  <>
                    {searchValue ? (
                      nodes.map((node: any, index: any) => (
                        <TopicComponent
                          key={`node-${index}`}
                          nodeElement={node}
                          color={_colors[index % _colors.length]}
                        />
                      ))
                    ) : (
                      <SkeletonsPanel
                        nodes={nodes}
                        currentProject={currentProject}
                      />
                    )}
                  </>
                ) : (
                  <NoData
                    title="Oops! No results found."
                    content="Please try again with different keywords."
                  />
                )}
              </>
            )}
          </>
        )}
      </View>
    </Screen>
  );
};

export default LandingScreen;
