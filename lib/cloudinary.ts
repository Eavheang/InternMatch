import { v2 as cloudinary } from 'cloudinary';

// Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
function parseCloudinaryUrl(url: string | undefined) {
  if (!url) {
    throw new Error('CLOUDINARY_URL environment variable is not set');
  }

  // Format: cloudinary://api_key:api_secret@cloud_name
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  
  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  }

  const [, api_key, api_secret, cloud_name] = match;
  
  return {
    cloud_name,
    api_key,
    api_secret,
  };
}

// Configure Cloudinary using the connection string
const config = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

export async function uploadResumeToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  studentId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `resumes/${studentId}`,
        resource_type: 'raw', // For PDF files
        format: 'pdf',
        public_id: `${fileName}-${Date.now()}`,
        allowed_formats: ['pdf'],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteResumeFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
  });
}

export { cloudinary };

