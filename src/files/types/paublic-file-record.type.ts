import { FileStatus } from '../file-record.entity';

export type PaublicFileRecord = {
  id: string;
  ownerUserId: string;
  status: FileStatus;
  contentType: string;
  sizeBytes: number;
  objectKey: string;
  bucket: string;
  publicUrl: string;
};
