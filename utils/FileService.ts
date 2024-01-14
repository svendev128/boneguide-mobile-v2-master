import * as FileSystem from "expo-file-system";

class FileService {
  #rootFolderName: string;

  constructor() {
    this.#rootFolderName = "boneguide_files";
  }

  #saveFile = async (
    fileUrl: string,
    fileType: string,
    folderName: string
  ): Promise<string | null> => {
    try {
      if (!fileUrl || fileUrl.trim() === "") return null;

      const directory = FileSystem.documentDirectory + folderName;
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const fileExtension = fileUrl.split(".").pop();
      const fileName = `${fileType}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExtension}`;
      const fileUri = `${directory}/${fileName}`;

      const downloadedFile = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (downloadedFile && downloadedFile.status === 200) {
        return downloadedFile.uri;
      } else {
        throw new Error(`Failed to download image: ${fileUrl}`);
      }
    } catch (error) {
      console.log("#saveFile", error);
      throw error;
    }
  };

  #isItemFile = (item: any) => {
    return item.type === "image" || item.type === "customFile";
  };

  #fileInfo = (item: any) => {
    let key = "",
      type = "";

    if (item.type === "image") {
      key = "src";
      type = "image";
    } else if (item.type === "customFile") {
      key = "href";
      type = "file";
    }

    return {
      key,
      type,
    };
  };

  async saveImagesAndDocs(hospitalId: any, contentText: string) {
    try {
      const data = JSON.parse(contentText);

      for (const item of data.content) {
        if (!this.#isItemFile(item)) continue;
        let { key, type } = this.#fileInfo(item);

        let folderName = `${this.#rootFolderName}/hospital_${hospitalId}`;

        const localPath = await this.#saveFile(
          item.attrs[key],
          type,
          folderName
        );

        item.attrs[key] = localPath;
      }

      return JSON.stringify(data);
    } catch (error) {
      throw error;
    }
  }

  async deleteHospitalFiles(hospitalId: any) {
    const directory = FileSystem.documentDirectory + `${this.#rootFolderName}/hospital_${hospitalId}`;

    const dirInfo = await FileSystem.getInfoAsync(directory);
    
    if (dirInfo.exists) {
      try {
        await FileSystem.deleteAsync(directory);
      } catch (error) {
        console.log("deleteHospitalFiles", error);
        throw error;
      }
    }
  }
}

export default new FileService();
