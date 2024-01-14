import OfflineSQLiteDatabase from "../OfflineSQLiteDatabase";
import GeneralDao from "./GeneralDao";

class SQLiteGeneralDao implements GeneralDao {
  offlineDatabase: OfflineSQLiteDatabase;

  constructor(offlineDatabase: OfflineSQLiteDatabase) {
    this.offlineDatabase = offlineDatabase;
  }

  async createTables() {
    const queries = [
      "CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);",
      "CREATE TABLE IF NOT EXISTS hospitals (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, maintenanceMode BOOLEAN DEFAULT 0, maintenanceDate DATETIME);",
      "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY NOT NULL, hospitalId INTEGER NOT NULL, FOREIGN KEY (hospitalId) REFERENCES hospitals(id) ON DELETE CASCADE);",
      "CREATE TABLE IF NOT EXISTS project_versions (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, isPublished BOOLEAN, projectId INTEGER NOT NULL, FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE);",
      `CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, content TEXT, projectVersionId INTEGER NOT NULL, parentNodeId INTEGER, grandParentNodeId INTEGER, FOREIGN KEY (projectVersionId) REFERENCES project_versions(id) ON DELETE CASCADE);`,
      "CREATE TABLE IF NOT EXISTS tag_node (nodeId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY (nodeId) REFERENCES nodes(id) ON DELETE CASCADE, FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE);",
    ];

    try {
      await this.offlineDatabase.executeQueries(queries);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }

  async dropTables() {
    const queries = [
      "DROP TABLE IF EXISTS tag_node",
      "DROP TABLE IF EXISTS nodes",
      "DROP TABLE IF EXISTS project_versions",
      "DROP TABLE IF EXISTS projects",
      "DROP TABLE IF EXISTS hospitals",
      "DROP TABLE IF EXISTS tags",
    ];

    try {
      await this.offlineDatabase.executeQueries(queries);
    } catch (error) {
      console.error("Error dropping table:", error);
    }
  }
}

export default SQLiteGeneralDao;
