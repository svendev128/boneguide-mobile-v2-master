import fileService from "../../utils/FileService";
import OfflineSQLiteDatabase from "../OfflineSQLiteDatabase";
import HospitalDao from "./HospitalDao";

class SQLiteHospitalDao implements HospitalDao {
  offlineDatabase: OfflineSQLiteDatabase;

  constructor(offlineDatabase: OfflineSQLiteDatabase) {
    this.offlineDatabase = offlineDatabase;
  }

  async deleteHospital(hospitalId: any) {
    await this.offlineDatabase.executeQuery(
      "DELETE FROM hospitals WHERE id=?",
      [hospitalId]
    );
  }

  async insertHospital(hospital: any, setPercentage: React.Dispatch<React.SetStateAction<number | undefined>>) {
    setPercentage(0);

    try {
      // clean
      await this.offlineDatabase.executeQuery(
        "DELETE FROM hospitals WHERE id=?",
        [hospital.id]
      );

      // delete hospital files
      await fileService.deleteHospitalFiles(hospital.id);

      await this.offlineDatabase.executeQuery(
        "INSERT INTO hospitals (id, name, maintenancemode, maintenancedate) VALUES (?, ?, ?, ?)",
        [
          hospital.id,
          hospital.name,
          hospital.maintenanceMode,
          hospital.maintenanceDate,
        ]
      );

      for (let project of hospital.projects) {
        await this.offlineDatabase.executeQuery(
          "INSERT INTO projects (id, hospitalId) VALUES (?, ?)",
          [project.id, hospital.id]
        );

        for (let version of project.versions) {
          await this.offlineDatabase.executeQuery(
            "INSERT INTO project_versions (id, name, isPublished, projectId) VALUES (?, ?, ?, ?)",
            [version.id, version.name, version.isPublished, project.id]
          );

          let nodeAdded = 0;
          let percentage = 0;

          for (let node of version.nodes) {
            // Download images and files
            let newContent = await fileService.saveImagesAndDocs(hospital.id, node.content);

            await this.offlineDatabase.executeQuery(
              "INSERT INTO nodes (id, title, content, parentNodeId, grandParentNodeId, projectVersionId) VALUES (?, ?, ?, ?, ?, ?)",
              [
                node.id,
                node.title,
                newContent,
                node.parentNodeId,
                node.grandParentNodeId,
                version.id,
              ]
            );

            for (let { tag } of node.tags) {
              await this.offlineDatabase.executeQuery(
                "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)",
                [tag.id, tag.name]
              );

              await this.offlineDatabase.executeQuery(
                "INSERT INTO tag_node (nodeId, tagId) VALUES (?, ?)",
                [node.id, tag.id]
              );
            }

            nodeAdded++;
            percentage = Math.ceil((nodeAdded*100) / version.nodes.length);

            setPercentage(percentage);
          }
        }
      }
    } catch (error) {
      console.log("insertHospital error: ", error);
    }
  }

  async selectHospital(hospitalId: any) {
    if (!hospitalId) return null;

    try {
      const results = await this.offlineDatabase.executeQuery(
        "SELECT * FROM hospitals WHERE id=?",
        [hospitalId]
      );
      if (results.rows.length == 0) return null;

      return results.rows.item(0);
    } catch (error) {
      return null;
    }
  }

  async selectHospitalsByQuery(query: string) {
    try {
      const results = await this.offlineDatabase.executeQuery(
        "SELECT * FROM hospitals WHERE name LIKE ?",
        [`%${query}%`]
      );
      if (results.rows.length == 0) return [];

      const hospitals = [];
      for (var i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        hospitals.push(row);
      }

      return hospitals;
    } catch (error) {
      return [];
    }
  }

  async selectHospitals(limit?: number) {
    try {
      let sql = "SELECT * FROM hospitals";
      let parameters = [];
      if (limit) {
        sql += "\nLIMIT ?";
        parameters.push(limit);
      }

      const results = await this.offlineDatabase.executeQuery(sql, parameters);
      if (results.rows.length == 0) return [];

      const hospitals = [];
      for (var i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        hospitals.push(row);
      }

      return hospitals;
    } catch (error) {
      return [];
    }
  }

  async selectVersionName(hospitalId: any) {
    try {
      const results = await this.offlineDatabase.executeQuery(
        `
        SELECT name FROM project_versions WHERE isPublished=1 AND projectId IN (
          SELECT id FROM projects WHERE hospitalId=?
        )
      `,
        [hospitalId]
      );

      if (results.rows.length == 0) return null;

      return results.rows.item(0).name;
    } catch (error) {
      return null;
    }
  }
}

export default SQLiteHospitalDao;
