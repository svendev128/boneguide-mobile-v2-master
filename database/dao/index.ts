import OfflineSQLiteDatabase from "../OfflineSQLiteDatabase";

import SQLiteGeneralDao from "./SQLiteGeneralDao";
import SQLiteHospitalDao from "./SQLiteHospitalDao";
import SQLiteNodeDao from "./SQLiteNodeDao";

const offlineDatabase = new OfflineSQLiteDatabase("sqlite_offline.db");

const generalDao = new SQLiteGeneralDao(offlineDatabase);
const hospitalDao = new SQLiteHospitalDao(offlineDatabase);
const nodeDao = new SQLiteNodeDao(offlineDatabase);

export { generalDao, hospitalDao, nodeDao };

