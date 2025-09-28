import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { TeamsModule } from "./teams/teams.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      }),
      inject: [ConfigService],
    }), UserModule, TeamsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
