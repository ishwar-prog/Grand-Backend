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

const uploadVideoAsHLS = async (localfilepath) => {
    try {
        if (!localfilepath || !fs.existsSync(localfilepath)) {
            return null;
        }

        const uploadOptions = {
            resource_type: "video",
            folder: "video-app",
            use_filename: false,
            unique_filename: true,
            eager: [
                {
                    streaming_profile: "streamora_hls", // Custom profile: 144p, 240p, 360p, 480p, 720p, 1080p
                    format: "m3u8"
                }
            ],
            eager_async: true,
        };

        // Only attach notification_url if it's set in the environment
        if (process.env.CLOUDINARY_WEBHOOK_URL) {
            uploadOptions.notification_url = process.env.CLOUDINARY_WEBHOOK_URL;
        }

        console.log("Starting video upload to Cloudinary for HLS...", localfilepath);
        // In Cloudinary SDK v2, uploader.upload handles large files automatically via chunked uploads.
        // upload_large was changed to return a Stream in v2, so we must use upload() directly.
        const response = await cloudinary.uploader.upload(localfilepath, uploadOptions);
        
        if (!response || !response.secure_url) {
            console.error("Cloudinary returned an invalid response:", response);
            return null;
        }
        
        console.log("Cloudinary upload successful:", response.secure_url);

        // Delete local file after successful upload
        await fs.promises.unlink(localfilepath);

        console.log("Video uploaded. HLS processing in background:", response.secure_url);
        return response;

    } catch (error) {
        // cleanup on error
        try {
            if (localfilepath && fs.existsSync(localfilepath)) {
                await fs.promises.unlink(localfilepath);
            }
        } catch (unlinkError) {
            console.error("Failed to delete local video file", unlinkError.message);
        }
        console.error("Failed to upload video as HLS to Cloudinary. Full Error:", error);
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



// Derives a thumbnail from a Cloudinary video URL on-the-fly.
// Uses Cloudinary's `so_5` transformation to capture the frame at 5 seconds.
// No extra API call — the URL is generated and cached by Cloudinary's CDN on first access.
const getAutoThumbnailUrl = (videoUrl) => {
    if (!videoUrl) return '';
    return videoUrl
        .replace('/video/upload/', '/video/upload/so_5/')
        .replace(/\.[^/.]+$/, '.jpg');
};

// Creates the custom HLS streaming profile on Cloudinary (safe to call repeatedly — skips if already exists).
const ensureCloudinaryStreamingProfile = async () => {
    try {
        await cloudinary.api.create_streaming_profile("streamora_hls", {
            display_name: "Streamora HLS",
            representations: [
                { transformation: [{ width: 256,  height: 144,  bit_rate: "150k",  codec: "h264" }] },
                { transformation: [{ width: 426,  height: 240,  bit_rate: "300k",  codec: "h264" }] },
                { transformation: [{ width: 640,  height: 360,  bit_rate: "700k",  codec: "h264" }] },
                { transformation: [{ width: 854,  height: 480,  bit_rate: "1200k", codec: "h264" }] },
                { transformation: [{ width: 1280, height: 720,  bit_rate: "2500k", codec: "h264" }] },
                { transformation: [{ width: 1920, height: 1080, bit_rate: "5000k", codec: "h264" }] },
            ]
        });
        console.log("Cloudinary streaming profile 'streamora_hls' created successfully");
    } catch (error) {
        if (error?.http_code === 409 || error?.error?.http_code === 409 || (error?.message || '').includes("already exists")) {
            console.log("Cloudinary streaming profile 'streamora_hls' already exists — skipping creation");
        } else {
            console.error("Failed to create Cloudinary streaming profile:", error.message);
        }
    }
};

export { uploadToCloudinary, uploadVideoAsHLS, deleteOnCloudinary, getAutoThumbnailUrl, ensureCloudinaryStreamingProfile };