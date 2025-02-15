import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_SECRECT } from "../config/env.js";


cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRECT,
});

const uploadOnCloudinary = async (localPath) => {
  try {
    if (!localPath) return null;

    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    console.log("Error Occur while upload file cloudinary");
  }
};

const deleteResourseFromCloudinary=async (publicId)=>{
   try {
      const response=await cloudinary.uploader.destroy(publicId)
      console.log("Sucessfully image deleted from cloudinary")
   } catch (error) {
    console.log("Error occur while deleting the image from cloudinary",error)
     return null
   }
}
export {uploadOnCloudinary,deleteResourseFromCloudinary}
