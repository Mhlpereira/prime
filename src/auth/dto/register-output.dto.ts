import { Expose } from "class-transformer";



export class OutputRegisterDto{
    @Expose()
    name: string;

    @Expose()
    email: string; 
}