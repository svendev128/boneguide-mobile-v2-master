interface NodeDao {
  selectNodeById(id: any): Promise<any>;
  getBreadcrumb(node: any): Promise<any>;
  selectNodesByNodeId(id: any, query: string): Promise<any>;
  selectHospitalNodes(hospitalId: any): Promise<any>;
  selectDefaultNode(hospitalId: any): Promise<any>;
}

export default NodeDao;
