import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { GymModule } from './gym/gym.module';
import { CustomLoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports:[
    ConfigModule.forRoot({
        isGlobal:true,
    }),
        UserModule, AuthModule, GymModule, CustomLoggerModule, PrismaModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
