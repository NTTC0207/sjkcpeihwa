"use server";

import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary.
 * If it's an image, it converts it to AVIF.
 * If it's another file type, it uploads it as is.
 *
 * @param {File|FormData} fileOrFormData - The file to upload
 * @returns {Promise<{url: string, public_id: string}|null>} The secure URL and public ID of the uploaded file
 */
export const uploadToCloudinary = async (fileOrFormData) => {
  let file;

  if (fileOrFormData instanceof FormData) {
    file = fileOrFormData.get("file");
  } else {
    file = fileOrFormData;
  }

  if (!file || !(file instanceof Blob)) {
    console.error("No valid file provided to uploadToCloudinary");
    return null;
  }

  try {
    const fileType = file.type;
    const fileSize = file.size; // in bytes

    // 10MB hard limit
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let processedBuffer = buffer;
    let uploadOptions = {
      folder: "school_uploads",
      resource_type: "auto",
    };

    // If it's an image, convert to AVIF with dynamic quality
    if (fileType.startsWith("image/")) {
      const sizeMB = fileSize / (1024 * 1024);

      // Determine quality based on file size to aim for < 400KB
      let targetQuality = 65;
      if (sizeMB > 8) {
        targetQuality = 35;
      } else if (sizeMB > 5) {
        targetQuality = 45;
      } else if (sizeMB > 3) {
        targetQuality = 55;
      }

      const image = sharp(buffer);
      const metadata = await image.metadata();

      // If dimensions are huge, resize to help with file size and performance
      // Only resize if significantly larger than 2K resolution
      if (metadata.width > 2560 || metadata.height > 2560) {
        image.resize(2560, 2560, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      processedBuffer = await image
        .avif({
          quality: targetQuality,
          effort: 4,
          lossless: false,
        })
        .toBuffer();

      uploadOptions.format = "avif";
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
            });
          }
        },
      );

      uploadStream.end(processedBuffer);
    });
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error);
    throw new Error(`Failed to process or upload file: ${error.message}`);
  }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 *
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The resource type (image, video, raw)
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image",
) => {
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};
