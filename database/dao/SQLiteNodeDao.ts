import OfflineSQLiteDatabase from "../OfflineSQLiteDatabase";
import { findFirstImageSrc } from "../utils";
import NodeDao from "./NodeDao";

const nodesTitles = [
  "Clavicle",
  "Shoulder",
  "Upper arm",
  "Elbow",
  "Forearm",
  "Wrist",
  "Hand",
  "Hip, pelvis and femur",
  "Thigh",
  "Knee",
  "Lower Leg",
  "Ankle",
  "Foot",
  "Scapula",
  "Spine",
  "Hip",
  "Pelvis",
];

const ROOT_NODE_TITLE = "BoneGuide";
const ADULT_NODE_TITLE = "Adult Fractures Guidelines";

class SQLiteNodeDao implements NodeDao {
  offlineDatabase: OfflineSQLiteDatabase;

  constructor(offlineDatabase: OfflineSQLiteDatabase) {
    this.offlineDatabase = offlineDatabase;
  }

  async selectNodeById(id: any) {
    const hospitalResult = await this.offlineDatabase.executeQuery(
      `SELECT * FROM hospitals WHERE id IN (
            SELECT hospitalId FROM projects WHERE id IN (
                SELECT projectId FROM project_versions WHERE id IN (
                    SELECT projectVersionId FROM nodes WHERE id = ?
                )
            )
        )`,
      [id]
    );

    const maintenanceMode = hospitalResult.rows.item(0).maintenanceMode == 1;

    if (maintenanceMode)
      return {
        maintenanceMode,
      };

    const results = await this.offlineDatabase.executeQuery(
      "SELECT * FROM nodes WHERE id=?",
      [id]
    );

    if (results.rows.length == 0) return null;

    const childNodesResults = await this.offlineDatabase.executeQuery(
      "SELECT id, title, content FROM nodes WHERE parentNodeId=?",
      [id]
    );

    const childNodes = [];
    for (var i = 0; i < childNodesResults.rows.length; i++) {
      var childNode = childNodesResults.rows.item(i);
      const image = findFirstImageSrc(childNode.content);

      childNodes.push({
        ...childNode,
        image,
      });
    }

    return {
      ...results.rows.item(0),
      maintenanceMode,
      childNodes,
    };
  }

  async getBreadcrumb(node: any) {
    const breadcrumb = [
      {
        id: node.id,
        title: node.title,
      },
    ];

    let n = { ...node };

    while (n.parentNodeId != null) {
      n = await this.selectNodeById(n.parentNodeId);

      breadcrumb.push({
        id: n.id,
        title: n.title,
      });
    }

    return breadcrumb.reverse();
  }

  async selectNodesByNodeId(id: any, query: string) {
    try {
      let sql = '';
      let parameters;

      if (!query) {
        parameters = [id, ...nodesTitles];

        sql = `
          SELECT id, title
          FROM nodes
          WHERE grandParentNodeId = ?
          AND title IN (${nodesTitles.map(() => '?').join(",")})
          ORDER BY title ASC;
        `
      }
      else {
        parameters = [id, query, query];

        sql = `
          SELECT id, title
          FROM nodes
          WHERE grandParentNodeId = ?
          AND (
            title LIKE '%' || ? || '%' COLLATE NOCASE
            OR
            EXISTS (
              SELECT 1
              FROM tag_node tn
              WHERE tn.nodeId = nodes.id AND tn.tagId IN (
                  SELECT id
                  FROM tags
                  WHERE name LIKE '%' || ? || '%' COLLATE NOCASE
                )
            )
          )
          ORDER BY title ASC;
        `
      }

      const results = await this.offlineDatabase.executeQuery(sql, parameters);

      if (results.rows.length == 0) return [];

      const nodes = [];

      for (var i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        nodes.push(row);
      }

      return nodes;
    } catch (e) {
      console.log("DAO error : ", e);
      return null;
    }
  }

  async selectHospitalNodes(hospitalId: any) {
    try {
      const sql = `
        SELECT
          n.id,
          n.title,
          n.projectVersionId
        FROM nodes n
        JOIN project_versions pv ON n.projectVersionId = pv.id
        JOIN projects p ON pv.projectId = p.id
        WHERE
          p.hospitalId = ?
          AND pv.isPublished = 1
          AND n.parentNodeId IN (
            SELECT id FROM nodes pn WHERE pn.title = ?
          )
        ORDER BY n.title ASC;
      `;

      const parameters = [hospitalId, ROOT_NODE_TITLE];

      const results = await this.offlineDatabase.executeQuery(sql, parameters);

      if (results.rows.length == 0) return [];

      const nodes = [];

      for (var i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        nodes.push(row);
      }

      return nodes;
    } catch (e) {
      console.log("DAO error : ", e);
      return null;
    }
  }

  async selectDefaultNode(hospitalId: any) {
    const query = `
      SELECT
        n.id,
        n.title,
        n.projectVersionId
      FROM nodes n
      JOIN project_versions pv ON n.projectVersionId = pv.id
      JOIN projects p ON pv.projectId = p.id
      WHERE
        n.title = ? AND
        pv.isPublished = 1 AND
        p.hospitalId = ? AND
        n.parentNodeId IN (SELECT id FROM nodes WHERE title = ?)
      LIMIT 1;
    `;

    const parameters = [ADULT_NODE_TITLE, hospitalId, ROOT_NODE_TITLE];

    const results = await this.offlineDatabase.executeQuery(query, parameters);

    if (results.rows.length == 0) return null;

    return results.rows.item(0);
  }
}

export default SQLiteNodeDao;
