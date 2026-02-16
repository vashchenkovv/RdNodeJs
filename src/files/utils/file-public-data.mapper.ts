import { ClientS3Service } from '../client-s3.service';
import { FileRecord, FileStatus } from '../file-record.entity';

export type PaublicFileRecord = {
  id: string;
  ownerUserId: string;
  status: FileStatus;
  contentType: string;
  sizeBytes: number;
  objectKey: string;
  bucket: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publicUrl: string;
};

export class FilePublicDataMapper {
  constructor(private s3Service: ClientS3Service) {}

  map(file: FileRecord): PaublicFileRecord {
    return {
      id: file.id,
      ownerUserId: file.ownerUserId,
      status: file.status,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      objectKey: file.objectKey,
      bucket: file.bucket,
      completedAt: file.completedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      publicUrl: this.s3Service.buildPublicUrl(file.objectKey),
    };
  }
}
