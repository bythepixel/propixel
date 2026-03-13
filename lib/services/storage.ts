import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";

class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";
    this.bucketName = process.env.AWS_S3_BUCKET || null;

    if (accessKeyId && secretAccessKey && this.bucketName) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  /**
   * Uploads a file to S3 or local storage as fallback.
   * @returns The URL or relative path to the uploaded file.
   */
  async uploadFile(
    filePath: string,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    if (this.s3Client && this.bucketName) {
      try {
        const fileStream = fs.createReadStream(filePath);
        const parallelUploads3 = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: `rfps/${Date.now()}-${fileName}`,
            Body: fileStream,
            ContentType: mimeType,
          },
        });

        const result = await parallelUploads3.done();
        return result.Location || "";
      } catch (error) {
        console.warn("S3 upload failed, falling back to local storage:", error);
      }
    }

    // Local fallback
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${fileName}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);
    fs.copyFileSync(filePath, destinationPath);

    return `/uploads/${uniqueFileName}`;
  }
}

export const storageService = new StorageService();
