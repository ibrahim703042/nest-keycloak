import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto, LogoutDto } from './dto/create-auth.dto';
import { KeycloakAuthService } from 'src/helpers/keycloak-config/keycloak-auth.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(private readonly keycloakService: KeycloakAuthService) {}

  async login(credentials: LoginDto) {
    try {
      const user = await this.keycloakService.login({
        username: credentials.username,
        password: credentials.password,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: user,
      };
    } catch (error) {
      this.logger.error(`Login Error: ${error.message}`, error.stack);
      throw new HttpException(
        { statusCode: HttpStatus.UNAUTHORIZED, message: 'Invalid credentials' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async adminAuth(credentials: LoginDto) {
    try {
      const user = await this.keycloakService.login({
        username: credentials.username,
        password: credentials.password,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Admin authentication successful',
        data: user,
      };
    } catch (error) {
      this.logger.error(`AdminAuth Error: ${error.message}`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid admin credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async logout(logoutDto: LogoutDto) {
    try {
      await this.keycloakService.logoutUser(logoutDto.userId);
      return { statusCode: HttpStatus.OK, message: 'Logout successful' };
    } catch (error) {
      this.logger.error(`Logout Error: ${error.message}`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to logout',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
