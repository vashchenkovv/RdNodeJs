import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRecord, FileStatus } from './file-record.entity';
import { DataSource, Repository } from 'typeorm';
import { ClientS3Service } from './client-s3.service';
import { AuthUser } from 'src/auth/types/auth.type';
import { PresignFileDto } from './dto/presign-file.dto';
import { randomUUID } from 'node:crypto';
import { FilePublicDataMapper } from './utils/file-public-data.mapper';
import { isOwnerOrStaffUtil } from './utils/is-owner-or-staff.util';

export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'image/tiff',
  'image/bmp',
] as const;

export enum FILE_KIND {
  AVATAR = 'avatar',
  PRODUCT_IMAGE = 'product-image',
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
};

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileRecord)
    private filesRepository: Repository<FileRecord>,
    private s3Service: ClientS3Service,
    private dataSource: DataSource,
  ) {}

  buildPublicUrl(objectKey: string): string {
    return this.s3Service.buildPublicUrl(objectKey);
  }

  private buildObjectKey(
    kind: FILE_KIND,
    userId: string,
    contentType: string,
  ): string {
    const ext = EXTENSION_BY_TYPE[contentType] ?? 'bin';
    return `${kind}/${userId}/${Date.now()}-${randomUUID()}.${ext}`;
  }

  async createPresignedUpload(user: AuthUser, presignFileDto: PresignFileDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const _fileRecordRepository =
        queryRunner.manager.getRepository(FileRecord);

      const objectKey = this.buildObjectKey(
        presignFileDto.kind,
        user.sub,
        presignFileDto.contentType,
      );

      const file = _fileRecordRepository.create({
        ownerUserId: user.sub,
        objectKey,
        bucket: this.s3Service.getBucketName(),
        contentType: presignFileDto.contentType,
        sizeBytes: presignFileDto.sizeBytes,
        status: FileStatus.PENDING,
        completedAt: null,
      });

      const saved = await _fileRecordRepository.save(file);

      const presigned = await this.s3Service.presignPutObject({
        key: saved.objectKey,
        contentType: saved.contentType,
        sizeBytes: saved.sizeBytes,
      });

      return {
        fileId: saved.id,
        status: saved.status,
        objectKey: saved.objectKey,
        uploadUrl: presigned.uploadUrl,
        uploadMethod: 'PUT',
        uploadHeaders: {
          'Content-Type': saved.contentType,
        },
        expiresInSec: presigned.expiresInSec,
        publicUrl: this.s3Service.buildPublicUrl(saved.objectKey),
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async completeUpload(fileId: string, user: AuthUser) {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException('File not found');

    this.assertOwnerOrStaff(file, user);

    if (file.status === FileStatus.READY) {
      return new FilePublicDataMapper(this.s3Service).map(file);
    }

    const exists = await this.s3Service.objectExists(file.objectKey);
    if (!exists) {
      throw new BadRequestException('File object is missing in storage');
    }

    file.status = FileStatus.READY;
    file.completedAt = new Date();
    const saved = await this.filesRepository.save(file);

    return new FilePublicDataMapper(this.s3Service).map(saved);
  }

  private assertOwnerOrStaff(file: FileRecord, user: AuthUser): void {
    const isOwnerOrStaff = isOwnerOrStaffUtil(file, user);
    if (!isOwnerOrStaff) {
      throw new ForbiddenException('Access denied');
    }
  }

  async getFileById(fileId: string, user: AuthUser) {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException('File not found');

    this.assertOwnerOrStaff(file, user);
    return new FilePublicDataMapper(this.s3Service).map(file);
  }

  async getOwnedFile(fileId: string, ownerUserId: string): Promise<FileRecord> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException('File not found');

    if (file.ownerUserId !== ownerUserId)
      throw new ForbiddenException('You can use only your own uploaded files');

    if (file.status !== FileStatus.READY)
      throw new BadRequestException('File upload is not completed');

    return file;
  }
}
