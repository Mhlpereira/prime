import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { CustomLogger } from "./custom.logger";

@Module({
    imports: [LoggerModule.forRoot()],
    providers: [CustomLogger],
    exports: [CustomLogger],
})
export class CustomLoggerModule {}
