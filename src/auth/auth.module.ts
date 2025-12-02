import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';

import { JwtModule } from '@nestjs/jwt'; // <--- IMPORTAR

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([User]),
    // AGREGAR ESTO:
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'SecretKey123',
      signOptions: { expiresIn: '2h' },
    }),
  ],
})
export class AuthModule {}
