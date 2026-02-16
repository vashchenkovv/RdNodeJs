import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { ClientS3Service } from './client-s3.service';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRecord } from './file-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileRecord])],
  controllers: [FilesController],
  providers: [ClientS3Service, FilesService],
  exports: [FilesService, TypeOrmModule],
})
export class FilesModule {}
