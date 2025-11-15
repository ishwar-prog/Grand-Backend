import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadToCloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath)
            return null
        //upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto",
        })
        //file has benn uploaded successfull
       // console.log("File uploaded on Cloudinary successfully", response.url);
       fs.unlinkSync(localfilepath); //delete the local file after upload
        return response;

    }catch(error){ 
        fs.unlinkSync(localfilepath); //delete the local file in case of error
        return null;
    }
}

export { uploadToCloudinary };