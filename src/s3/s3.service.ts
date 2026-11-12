import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service implements OnModuleDestroy {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    if (!region || !bucketName) {
      throw new Error('AWS S3 configuration is missing');
    }

    this.bucketName = bucketName;

    // Uses the AWS SDK's default credential provider chain.
    // Locally, it can use your configured AWS CLI credentials.
    this.s3Client = new S3Client({ region });
  }

  async getImageUrl(key: string | null): Promise<string | null> {
    if (!key) return null;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
  }

  onModuleDestroy() {
    this.s3Client.destroy();
  }
}


