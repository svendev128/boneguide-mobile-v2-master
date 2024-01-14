interface GeneralDao {
  createTables(): Promise<void>;
  dropTables(): Promise<void>;
}

export default GeneralDao;
