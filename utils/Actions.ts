import offlineService from "../database/service";
import { callEndpoint } from "./api";

class Actions {
  constructor() {}

  async getNode(isConnected: any, nodeId: any) {
    let result;

    if (isConnected) {
      const { data } = await callEndpoint({
        endpoint: `projects/node/${nodeId}`,
      });
      result = data;
    } else {
      const data: any = await offlineService.getNode(nodeId);
      result = data;
    }

    return result;
  }

  async getCurrentVersionName(isConnected: any, hospitalId: any) {
    let versionName;

    if (!isConnected) {
      versionName = await offlineService.getCurrentVersionName(hospitalId);
    } else {
      const { data } = await callEndpoint({
        endpoint: `flow/version/${hospitalId}`,
      });

      if (data && data.currentVersion) {
        versionName = data.currentVersion.name;
      }
    }

    return versionName;
  }

  async searchHospitals(isConnected: any, query: string) {
    if (isConnected) {
      const { data } = await callEndpoint({
        endpoint: `hospitals?q=${query}`,
      });

      return data;
    } else {
      const offlineHospitals = await offlineService.searchHospitals(query);
      return offlineHospitals;
    }
  }

  async getDefaultHospital(isConnected: any) {
    if (!isConnected) {
      const data: any = await offlineService.getDefaultHospital();
      return data;
    } else {
      const { data } = await callEndpoint({ endpoint: `hospitals/default` });
      return data;
    }
  }

  async getDefaultProject(isConnected: any, hospitalId: any) {
    if (!isConnected) {
      const data = await offlineService.getDefaultProject(hospitalId);
      return data;
    } else {
      const { data } = await callEndpoint({
        endpoint: `hospitals/${hospitalId}/default-project`,
      });
      return data;
    }
  }

  async getHospital(isConnected: any, hospitalId: any) {
    if (!isConnected) {
      const hospital = await offlineService.getHospital(hospitalId);
      return hospital;
    } else {
      const { data: hospital } = await callEndpoint({
        endpoint: `hospitals/${hospitalId}`,
      });
      return hospital;
    }
  }

  async getHospitalNodes(isConnected: any, hospitalId: any) {
    if (!isConnected) {
      const projects: any = await offlineService.getHospitalNodes(hospitalId);

      return projects;
    } else {
      const { data: projects } = await callEndpoint({
        endpoint: `projects/hospital/${hospitalId}`,
      });

      return projects;
    }
  }

  async getNodes(isConnected: any, rootId: any, query: string) {
    if (!isConnected) {
      const nodes = await offlineService.getNodes(rootId, query);

      return nodes;
    } else {
      const { data } = await callEndpoint({
        endpoint: `projects/${rootId}/root-nodes?q=${query}`,
        requiresAuth: true,
      });

      return data.nodes;
    }
  }
}

export default new Actions();
