import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { User } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  users: User[] = [];
  id = 0;

  @Get()
  getAll() {
    return this.users;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const oneUser = this.users.find((user) => user.id === id);
    if (!oneUser) throw new NotFoundException('User not found');
    return oneUser;
  }

  @Post()
  create(@Body() createUser: CreateUserDto) {
    const existingUser = this.users.find(
      (user) => user.email === createUser.email,
    );

    if (existingUser)
      throw new ConflictException('A user with this email already exists');

    const newUser: User = {
      id: ++this.id,
      name: createUser.name,
      email: createUser.email,
    };

    this.users.push(newUser);
    return newUser;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUser: UpdateUserDto,
  ) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');

    this.users[userIndex] = { ...this.users[userIndex], ...updateUser };
    return this.users[userIndex];
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
