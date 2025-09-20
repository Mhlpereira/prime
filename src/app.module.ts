import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [UserModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
