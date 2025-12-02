import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class HashService {
    private readonly rounds = 12;

    async hash(value: string): Promise<string> {
        return bcrypt.hash(value, this.rounds);
    }

    async compare(value: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(value, hashed);
    }
}
