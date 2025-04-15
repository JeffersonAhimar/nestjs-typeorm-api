import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import configuration from 'src/configuration/configuration';
import { Stream } from 'stream';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly s3Bucket: string;

  constructor(
    @Inject(configuration.KEY)
    private configService: ConfigType<typeof configuration>,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.aws.s3.region,
      credentials: {
        accessKeyId: this.configService.aws.accessKey,
        secretAccessKey: this.configService.aws.secretAccessKey,
      },
      // forcePathStyle: true, // for MinIO or another S3-like service
    });

    this.s3Bucket = this.configService.aws.s3.bucket;
  }

  handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { message: 'File uploaded successfully', filePath: file.path };
  }

  async uploadFileToS3(file: Express.Multer.File, isPublic = true) {
    // const timestamp = Date.now();
    // const key = `${timestamp}-${file.originalname}`;
    const key = `uploads/${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: isPublic ? 'public-read' : 'private',
    });

    try {
      await this.s3Client.send(command);

      const url = isPublic
        ? (await this.getS3FileUrl(key)).url
        : (await this.getS3PresignedSignedUrl(key)).url;

      return {
        url,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async deleteS3File(key: string) {
    const fileExists = await this.checkS3fileExists(key);
    if (!fileExists) {
      throw new NotFoundException('File does not exist in S3');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);

      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting file from S3: ${error?.message || error}`,
      );
    }
  }

  async getS3File(key: string): Promise<Stream> {
    const fileExists = await this.checkS3fileExists(key);
    if (!fileExists) {
      throw new NotFoundException('File does not exist in S3');
    }

    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new NotFoundException('File not found in S3');
      }

      return response.Body as Stream;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException(`File with key "${key}" not found`);
      }

      throw new InternalServerErrorException(
        `Error retrieving file from S3: ${error?.message || error}`,
      );
    }
  }

  private async checkS3fileExists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  private async getS3FileUrl(key: string) {
    return { url: `https://${this.s3Bucket}.s3.amazonaws.com/${key}` };
  }

  private async getS3PresignedSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
