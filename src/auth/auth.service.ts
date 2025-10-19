import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(name: string, email: string, password: string) {
    const exitingUser = await this.userService.findByEmail(email);
    if (exitingUser) throw new BadRequestException('Email already exists');
    const user = await this.userService.create(name, email, password);
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signin(email: string, password: string) {
    const validUser = await this.userService.findByEmail(email);
    if (!validUser) throw new BadRequestException('Invalid credentials');
    const valid = (await this.userService.validateUser(
      email,
      password,
    )) as Omit<UserDocument, 'password'> | null;
    if (!valid) throw new BadRequestException('Invalid credentials');
    const payload = {
      sub: valid._id,
      email: valid.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
