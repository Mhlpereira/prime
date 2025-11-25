import { Prop, Schema } from "@nestjs/mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({required: true})
    name: string;

    @Prop({ required: true})
    birthday: number;
   
}
