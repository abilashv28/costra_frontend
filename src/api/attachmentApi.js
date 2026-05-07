import api from "./axios";

export const getPresignedUrl = (key, contentType) =>
  api.post("/attachments/presigned-url", { key, contentType });

export const getFileUrl = (key) =>
  api.post("/attachments/get-url", { key });

// Upload file to S3 using pre-signed URL
export const uploadToS3 = async (presignedUrl, file) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to S3");
    }

    return response;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};