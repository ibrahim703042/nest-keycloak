import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, LogoutDto } from './dto/create-auth.dto';
import { AppHelperService } from 'src/helpers/app.helper.service';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appHelperService: AppHelperService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login into your account' })
  @ApiBody({ type: LoginDto, description: 'Credential for authentication' })
  login(@Body() credential: LoginDto) {
    return this.authService.login(credential);
  }

  @Post('login/admin')
  @ApiOperation({ summary: 'Login into accountn as admin' })
  @ApiBody({ type: LoginDto, description: 'Credential for authentication' })
  adminAuth(@Body() credential: LoginDto) {
    return this.authService.adminAuth(credential);
  }

  @ApiBearerAuth('authorization')
  @Get('user-info')
  @ApiOperation({ summary: 'Get Connected user information' })
  getUserInfo(@Req() request: Request) {
    const userInfo = this.appHelperService.decodeAccessToken(request);
    return userInfo;
  }

  @ApiBearerAuth('authorization')
  @Get('user-role/admin')
  @ApiOperation({ summary: 'Get Connected user role' })
  getRole(@Req() request: Request) {
    const result = this.appHelperService.getConnectedUserRole(request, 'admin');
    if (typeof result === 'string') {
      return { message: result };
    }

    return result;
  }

  @ApiBearerAuth('authorization')
  @Post('logout')
  @ApiOperation({ summary: 'Logout to your account' })
  logout(@Req() request: Request) {
    const user_Id = this.appHelperService.extractUserIdFromToken(request);
    const subId: LogoutDto = {
      userId: user_Id,
    };

    return this.authService.logout(subId);
  }
}
