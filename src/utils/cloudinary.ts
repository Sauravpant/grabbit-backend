import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET_KEY!,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, _) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "Grabbit",
        public_id: fileName,
      },
      (err: any, result) => {
        if (err) {
          console.error("Cloudinary Upload Error:", err);
        }
        resolve(result as CloudinaryUploadResult);
      }
    );
    stream.end(fileBuffer);
  });
};
