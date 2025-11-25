import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService{

    private readonly saltRounds = 10;

    async hash(data: string): Promise<string> {
        if (!data || data.trim() === "") {
            throw new BadRequestException('Dados para hash não podem estar vazios');
        }
        return bcrypt.hash(data, this.saltRounds);
    }
    
    async compare(data: string, hashedData: string): Promise<boolean> {
        if (!data || !hashedData) {
            throw new BadRequestException('Dados para comparação não podem estar vazios');
        }
        return bcrypt.compare(data, hashedData);
    }
}