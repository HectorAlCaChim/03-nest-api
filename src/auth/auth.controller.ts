import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Header, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { validRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('checkAuthStatus')
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivate(
    @GetUser() user: User,
    @Headers() headers: IncomingHttpHeaders,
    @RawHeaders() rawHeaders: string[]) {
    return {
      ok: true
    }
  }

  // get con roles
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(validRoles.superUser)
  @UseGuards(
    AuthGuard(), UserRoleGuard)
  testPrivate2(
    @GetUser() user: User) {
    return {
      ok: true
    }
  }

  @Get('private3')
  @Auth(validRoles.superUser)
  // @SetMetadata('roles', ['admin', 'super-user'])
  testPrivate3(
    @GetUser() user: User) {
    return {
      ok: true
    }
  }
}
