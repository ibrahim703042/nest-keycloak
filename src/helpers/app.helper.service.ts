import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { DecodedUserInfo } from './keycloak-config/types/declare';
import { Request } from 'express';

@Injectable()
export class AppHelperService {
  private readonly logger = new Logger(AppHelperService.name);
  private ipAddress = getServerIp();
  private port = process.env.PORT;
  private baseUrl = `http://${this.ipAddress}:${this.port}/avatar/`;

  constructor(private readonly jwtService: JwtService) {}

  formatTimestamp(timestamp: number): string {
    // return new Date(timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Bujumbura' });
    return new Date(timestamp).toLocaleString('en-GB', {
      timeZone: 'Africa/Bujumbura',
    });
  }

  extractTokenFromRequest(request: Request): string {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    return token;
  }

  extractUserIdFromToken(request: Request): string {
    const token = this.extractTokenFromRequest(request);
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.sub) {
      throw new UnauthorizedException('Invalid token or missing sub claim');
    }

    return decodedToken.sub;
  }

  decodeAccessToken(request: Request): DecodedUserInfo {
    try {
      const accessToken = this.extractTokenFromRequest(request);
      this.logger.debug('Access token extracted successfully');

      const decodedToken = this.jwtService.decode(accessToken);
      if (!decodedToken) {
        throw new UnauthorizedException('Invalid access token');
      }

      const userInfo: DecodedUserInfo = {
        userId: decodedToken['sub'],
        name: decodedToken['name'],
        email: decodedToken['email'],
        username: decodedToken['preferred_username'],
        givenName: decodedToken['given_name'],
        familyName: decodedToken['family_name'],
        roles: decodedToken['realm_access']?.['roles'] || [],
      };

      this.logger.debug('Access token decoded successfully', { userInfo });

      return userInfo;
    } catch (error) {
      this.logger.error(
        'Error decoding access token:',
        error.message,
        error.stack,
      );
      throw new UnauthorizedException('Failed to decode access token');
    }
  }

  getConnectedUserRole(request: Request, requiredRole?: string) {
    const decodedUser = this.decodeAccessToken(request);

    if (requiredRole) {
      if (!decodedUser.roles.includes(requiredRole)) {
        throw new ForbiddenException(
          `User does not have the required role: ${requiredRole}`,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: `User has the required role: ${requiredRole}`,
        role: requiredRole,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User roles retrieved successfully',
      roles: decodedUser.roles,
    };
  }

  formatAvatar(avatar: string | string[]): string | string[] {
    if (!avatar) return '';

    if (Array.isArray(avatar)) {
      return avatar.map((image) => this.baseUrl + image);
    }

    return this.baseUrl + avatar;
  }

  // envoi de message
  async emailSender(
    emailTo: string,
    subject: string,
    html: string,
    text: string,
  ) {
    const tranposrter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: '465',
      secure: true,
      auth: {
        user: process.env.USER_NODEMAILER,
        pass: process.env.NODEMAILER_PWD,
      },
    });

    this.logger.log({ emailTo, subject, html, text });

    const optiosMail = {
      from: `ASYST PAYALL<${process.env.USER_NODEMAILER}> `,
      to: emailTo,
      subject,
      text,
      html,
      attachments: null,
    };

    const myPromise = new Promise((resolve, reject) => {
      tranposrter.sendMail(optiosMail, (err, data) => {
        if (err) {
          this.logger.error({ err });

          reject(err);
        } else {
          this.logger.log({ data });

          resolve(data);
        }
      });
    });

    const data = myPromise
      .then((data) => {
        return data;
      })
      .catch((error) => {
        this.logger.error(error);
        return { error: "Echec d'envoi du mail" };
      });
    return data;
  }
}

export const codeGenerate = () => {
  return randomUUID().slice(0, 6);
};

const ignoreInterfacePatterns: RegExp[] = [
  /^vEthernet/i,
  /^VirtualBox/i,
  /^VMware/i,
  /^docker/i,
  /^br-/i,
  /^veth/i,
  /^lo/i,
  /^Loopback/i,

  // Wireless / Bluetooth
  /^Bluetooth/i,

  // Windows-specific (English)
  /^Local Area Connection\*/i,

  // Windows-specific (French)
  /^Connexion au réseau local\*/i,
  /^Connexion réseau Bluetooth/i,
  /^Carte réseau/i,
  /^Connexion réseau/i,
  /^Connexion Ethernet/i,

  // Miscellaneous
  /^TAP-/i, // VPN TAP adapters
  /^Npcap Loopback/i, // Wireshark/Npcap loopback
];

export const getServerIp = (): string => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    if (ignoreInterfacePatterns.some((pattern) => pattern.test(name))) {
      console.log(`[IGNORED] Interface: ${name}`);
      continue;
    }

    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        if (
          net.family === 'IPv4' &&
          !net.internal &&
          net.address !== '127.0.0.1'
        ) {
          console.log(`[SELECTED] Interface: ${name} → IP: ${net.address}`);
          return net.address;
        }
      }
    }
  }

  console.warn(
    '⚠️ No suitable external IPv4 address found. Falling back to 127.0.0.1',
  );
  return '127.0.0.1';
};
