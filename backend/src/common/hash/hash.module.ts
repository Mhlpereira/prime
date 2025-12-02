import { Module } from "@nestjs/common";
import { HashService } from "./hash.service";

@Module({
    providers: [HashService],
    exports: [HashService], // importante: exportar!
})
export class HashModule {}
