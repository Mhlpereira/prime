import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { GymModule } from './gym/gym.module';
import { ClassModule } from './class/class.module';
import { CustomLoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
    imports:[
    ConfigModule.forRoot({
        isGlobal:true,
    }),
        UserModule, AuthModule, GymModule, ClassModule, CustomLoggerModule, PrismaModule],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
