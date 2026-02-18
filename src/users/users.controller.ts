import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AttachFileDto } from 'src/files/dto/attach-file.dto';
import { AuthUser } from 'src/auth/types/auth.type';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOntByID(id);
  }

  @Post()
  create(@Body() createUser: CreateUserDto) {
    return this.usersService.addUser(createUser);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch('avatar')
  async setAvatar(
    @Req() req: Request & { user?: AuthUser },
    @Body() attachFileDto: AttachFileDto,
  ) {
    return this.usersService.setAvatar(
      (req.user as AuthUser).sub,
      attachFileDto.fileId,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUser: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUser);
  }
}
