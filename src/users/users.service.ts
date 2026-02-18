import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOntByID(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOntByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async addUser(user: Pick<User, 'name' | 'email'>): Promise<User> {
    const existUser = await this.findOntByEmail(user.email);
    if (existUser)
      throw new ConflictException('User with that email already exists');

    const newUser = this.usersRepository.create({
      name: user.name,
      email: user.email,
    });

    return this.usersRepository.save(newUser);
  }

  async updateUser(
    id: string,
    user: Pick<User, 'name' | 'email'>,
  ): Promise<User> {
    const existUser = await this.findOntByID(id);
    if (!existUser) throw new NotFoundException(`User not exists`);
    existUser.name = user.name;
    existUser.email = user.email;
    return this.usersRepository.save(existUser);
  }

  async setAvatar(
    userId: string,
    fileId: string,
  ): Promise<{ userId: string; avatarFileId: string; avatarUrl: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const file = await this.filesService.getOwnedFile(fileId, userId);
    user.avatarFileId = file.id;
    await this.usersRepository.save(user);

    return {
      userId: user.id,
      avatarFileId: file.id,
      avatarUrl: this.filesService.buildPublicUrl(file.objectKey),
    };
  }
}
