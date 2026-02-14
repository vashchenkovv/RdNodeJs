import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtPayload } from './types/auth.type';
import { Role } from 'src/users/roles.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: loginUserDto.email })
      .getOne();

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const ok = await bcrypt.compare(loginUserDto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = await this.roleRepository.find({
      where: { role: In([...user.roles]) },
    });

    const scopes = [
      ...new Set(
        (roles ?? []).reduce(
          (acc, role) => [...acc, ...(role.scopes ?? [])],
          [],
        ),
      ),
    ];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles ?? [],
      scopes,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ accessToken: string }> {
    const existUser = await this.usersRepository.findOneBy({
      email: registerUserDto.email,
    });
    if (existUser) throw new BadRequestException('Invalid email');

    const customerRole = await this.roleRepository.findOneBy({
      isDefCustomerRole: true,
    });

    const newUser: User = await this.usersRepository.save({
      name: registerUserDto.name,
      email: registerUserDto.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      passwordHash: bcrypt.hashSync(registerUserDto.password, 10),
      roles: customerRole ? [customerRole.role] : [],
    });

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      roles: newUser.roles ?? [],
      scopes: customerRole?.scopes ?? [],
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
