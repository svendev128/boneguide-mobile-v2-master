import { callEndpoint } from "../../utils/api";
import GeneralDao from "../dao/GeneralDao";
import HospitalDao from "../dao/HospitalDao";
import NodeDao from "../dao/NodeDao";

class OfflineService {
  nodeDao: NodeDao;
  hospitalDao: HospitalDao;
  generalDao: GeneralDao;

  constructor(
    nodeDao: NodeDao,
    hospitalDao: HospitalDao,
    generalDao: GeneralDao
  ) {
    this.nodeDao = nodeDao;
    this.hospitalDao = hospitalDao;
    this.generalDao = generalDao;
  }

  async init() {
    // create tables
    await this.generalDao.createTables();
  }

  async drop() {
    // drop tables
    await this.generalDao.dropTables();
    console.log('dropped tables');
  }

  async isUpdateAvailable(hospitalId: any): Promise<boolean> {
    const currentVersionName = await this.hospitalDao.selectVersionName(
      hospitalId
    );

    if (currentVersionName != null) {
      const { publishedVersionName } = await callEndpoint({
        endpoint: `hospitals/${hospitalId}/published-version`,
      });

      if (publishedVersionName != currentVersionName) {
        return true;
      }

      return false;
    }

    return true;
  }

  async sync(hospitalId: any, setPercentage: React.Dispatch<React.SetStateAction<number | undefined>>) {
    try {
      // get data
      console.log('getting data...');
      const { hospital } = await callEndpoint({
        endpoint: `offline/hospital/${hospitalId}`,
      });
      console.log('got data');

      // insert data
      console.log('inserting data...');
      await this.hospitalDao.insertHospital(hospital, setPercentage);
      console.log('inserted data');
    } catch (error) {
      console.log("Sync error : ", error);
    }
  }

  async isMissing(hospitalId: any) {
    const hospital = await this.hospitalDao.selectHospital(hospitalId);
    return hospital == null;
  }

  // Nodes Services
  async getNode(nodeId: any) {
    const node = await this.nodeDao.selectNodeById(nodeId);

    if (node == null) return null;

    const breadcrumb = await this.nodeDao.getBreadcrumb(node);

    return {
      node,
      breadcrumb,
    };
  }

  async getNodes(rootId: any, query: string) {
    const nodes = await this.nodeDao.selectNodesByNodeId(rootId, query);
    return nodes;
  }

  async getHospitalNodes(hospitalId: any) {
    const nodes = await this.nodeDao.selectHospitalNodes(hospitalId);
    return nodes;
  }

  // Hospitals services
  async getHospital(hospitalId: any) {
    const hospital = await this.hospitalDao.selectHospital(hospitalId);
    return hospital;
  }

  async getHospitals() {
    const hospitals = await this.hospitalDao.selectHospitals();
    return hospitals;
  }

  async searchHospitals(query: string) {
    const hospitals = await this.hospitalDao.selectHospitalsByQuery(query);
    return hospitals;
  }

  async getCurrentVersionName(hospitalId: any) {
    const versionName = await this.hospitalDao.selectVersionName(hospitalId);
    return versionName;
  }

  async getDefaultHospital() {
    const result = await this.hospitalDao.selectHospitals(1);
    if (result.length == 0) return null;

    const hospital = result[0];

    const project = await this.getDefaultProject(hospital.id);

    return {
      hospital,
      project,
    };
  }

  async getDefaultProject(hospitalId: any) {
    const project = await this.nodeDao.selectDefaultNode(hospitalId);
    return project;
  }
}

export default OfflineService;
