
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UsersService } from '../users/users.service';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly verifier;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    const clientId = this.config.get<string>('COGNITO_CLIENT_ID');

    if (!userPoolId || !clientId) {
      throw new Error('Cognito environment variables are missing');
    }

    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: {
        cognitoSub: string;
        userId: number;
        roleId: number;
        username: string;
      };
    }>();

    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.verifier.verify(token);

      const user = await this.usersService.findByCognitoSub(payload.sub);

      request.user = {
        cognitoSub: payload.sub,
        userId: user.userId,
        roleId: user.roleId,
        username: user.username,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired Cognito token');
    }
  }
}
