import ImageKit from "imagekit";
import fs from "fs/promises";

const imageKit = new ImageKit({
  publicKey: process.env.imageKit_Public_Key,
  privateKey: process.env.imageKit_Private_Key,
  urlEndpoint: process.env.imageKit_Url_Endpoint,
});

export const UploadImages = async (imageName, folderDetails = []) => {
  try {
    // Read file asynchronously
    const data = await fs.readFile(`./public/temp/image/${imageName}`);

    // Upload image to ImageKit
    const uploadedImg = await imageKit.upload({
      file: data, // required
      fileName: imageName, // required
      folder: folderDetails.folderStructure,
      isPrivateFile: false,
      useUniqueFileName: false,
    });

    // Delete the temporary image after uploading
    await fs.unlink(`./public/temp/image/${imageName}`);

    return uploadedImg;
  } catch (error) {
    console.error("Error in UploadImages:", error);
    throw error; // Ensure errors propagate to the caller
  }
};

export const DeleteImage = async (fileId = "") => {
  imageKit.deleteFile(fileId, function (error, result) {
    if (error) console.log(error);
    else console.log(result);
  });
};

export const DeleteBulkImage = async (fileId = []) => {
  imageKit
    .bulkDeleteFiles(fileId)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
