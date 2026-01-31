import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService
  ) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const oneUser = this.usersService.findOntByID(id);
    if (!oneUser) throw new NotFoundException('User not found');
    return oneUser;
  }

  @Post()
  create(@Body() createUser: CreateUserDto) {
    const existingUser = this.usersService.findOntByEmail(createUser.email);

    if (existingUser)
      throw new ConflictException('A user with this email already exists');

    const newUser = this.usersService.addUser(createUser);
    return newUser;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUser: UpdateUserDto,
  ) {
    const user = this.usersService.updateUser(id, updateUser);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.usersService.deleteUser(id);
  }
}
