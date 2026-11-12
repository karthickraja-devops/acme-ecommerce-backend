
import { Module } from '@nestjs/common';
import { CognitoAuthGuard } from './cognito-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [CognitoAuthGuard],
  exports: [CognitoAuthGuard],
})
export class AuthModule {}
