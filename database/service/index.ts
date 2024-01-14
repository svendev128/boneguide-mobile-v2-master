import { generalDao, hospitalDao, nodeDao } from "../dao";
import OfflineService from "./OfflineService";

const offlineService = new OfflineService(nodeDao, hospitalDao, generalDao);

export default offlineService;
