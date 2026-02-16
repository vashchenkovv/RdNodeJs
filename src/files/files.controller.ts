import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesService } from './files.service';
import { AuthUser } from 'src/auth/types/auth.type';
import { PresignFileDto } from './dto/presign-file.dto';
import { CompleteUploadDto } from './dto/compete-upload.dto';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  async presign(
    @Req() req: Request & { user?: AuthUser },
    @Body() presignFileDto: PresignFileDto,
  ) {
    return this.filesService.createPresignedUpload(
      req.user as AuthUser,
      presignFileDto,
    );
  }

  @Post('complete')
  async complete(
    @Req() req: Request & { user?: AuthUser },
    @Body() completeUploadDto: CompleteUploadDto,
  ) {
    return this.filesService.completeUpload(
      completeUploadDto.fileId,
      req.user as AuthUser,
    );
  }

  @Get(':id')
  async byId(
    @Req() req: Request & { user?: AuthUser },
    @Param('id') id: string,
  ) {
    return this.filesService.getFileById(id, req.user as AuthUser);
  }
}
