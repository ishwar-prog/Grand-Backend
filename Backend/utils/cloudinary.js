import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

//cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadToCloudinary = async (localfilepath)=>{
    try{                  //
        if (!localfilepath || !fs.existsSync(localfilepath)) {
            return null;
        }
        //upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto",
            folder : "video-app",            //Optional: organize uploads
            use_filename : false,
            unique_filename : true,  
        })
        //Successfully uploaded -> remove local file 
        await fs.promises.unlink(localfilepath)

        //file has been uploaded successfully
        console.log("File uploaded on Cloudinary successfully", response.url);
        return response;

    // }catch(error){ 
    //     fs.unlinkSync(localfilepath); //delete the local file in case of error
    //     return null;
    // }   sir method

    //ai
    } catch(error){
        //upload failed - clean up local file safely
        try{
            if(localfilepath && fs.existsSync(localfilepath)){
                await fs.promises.unlink(localfilepath)
            }
        }catch(unlinkError){
            console.error("Failed to delete local file", unlinkError.message);
        }
        console.error("Failed to upload file to Cloudinary", error.message);
        return null;
    }
}

    // delete file from cloudinary using url
    // @param {string} fileUrl - cloudinary public url
    // @param {string} resourceType - "image" | "video" | "raw"(dafault: "image")
    // @returns {boolean} Success status

    const deleteOnCloudinary = async(fileUrl , resourceType = "image") =>{
        try{
                if(!fileUrl){
                    throw new ApiError(400 , "File Url is required")
                }

                // extract public_id from the Cloudinary url
                const uploadIndex = fileUrl.indexOf('/upload/');
                if (uploadIndex === -1) {
                    throw new ApiError(400, "Invalid Cloudinary file URL");
                }

                let publicIdWithVersionAndExt = fileUrl.substring(uploadIndex + '/upload/'.length).split('?')[0];
                // remove version prefix if present: v123/
                publicIdWithVersionAndExt = publicIdWithVersionAndExt.replace(/^v\d+\//, '');
                // remove file extension
                const publicId = publicIdWithVersionAndExt.replace(/\.[^/.]+$/, '');

                const result = await cloudinary.uploader.destroy(publicId , {
                    resource_type: resourceType,
                    invalidate: true,   //remove from CDN cache
                })

                if(result.result !== "ok" && result.result !== "not found"){
                    throw new ApiError(500 , "Failed to delete file from Cloudinary")
                }

                console.log(`Deleted from cloudinary: ${publicId}`)
                return true;
            }catch(error){
                console.error("Cloudinary delete error", error.message);
                throw error instanceof ApiError ? error : new ApiError(500 , "Failed to delete file from Cloudinary")
            }
    }



export { uploadToCloudinary, deleteOnCloudinary };