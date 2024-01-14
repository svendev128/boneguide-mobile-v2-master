interface HospitalDao {
  deleteHospital(hospitalId: any): Promise<any>;
  insertHospital(hospital: any, setPercentage: React.Dispatch<React.SetStateAction<number | undefined>>): Promise<void>;
  selectHospital(hospitalId: any): Promise<any>;
  selectHospitalsByQuery(query: string): Promise<any>;
  selectHospitals(limit?: number): Promise<any[]>;
  selectVersionName(hospitalId: any): Promise<string>;
}

export default HospitalDao;