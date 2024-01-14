import * as SQLite from "expo-sqlite";

class OfflineSQLiteDatabase {
  db: SQLite.SQLiteDatabase;

  constructor(databaseName: string) {
    this.db = SQLite.openDatabase(databaseName);
    this.init();
  }

  async init() {
    await this.db.execAsync(
      [{ sql: "PRAGMA foreign_keys = ON;", args: [] }],
      false
    );
  }

  transaction = (): Promise<SQLite.SQLTransaction> => {
    return new Promise<any>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          resolve(tx);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  executeSql(
    tx: SQLite.SQLTransaction,
    query: string,
    params: any[] = []
  ): Promise<SQLite.SQLResultSet> {

    return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
      tx.executeSql(
        query,
        params,
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.log('executeSql', error);
          reject(error);
          return false;
        }
      );
    });
  }

  executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
      const tx = await this.transaction();
      const result = await this.executeSql(tx, query, params);
      return result;
    } catch (error) {
      console.log("Transaction error:", error);
    }
  };

  executeQueries = async (queries: string[]): Promise<void> => {
    try {
      for (let query of queries) {
        await this.executeQuery(query);
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export default OfflineSQLiteDatabase;
