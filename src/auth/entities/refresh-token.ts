import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types , Document } from "mongoose";

@Schema({ collection: 'refresh_tokens'})
export class RefreshToken extends Document {

    @Prop({ required: true})
    token: string;

    @Prop({required: true, ref: 'User', type: Types.ObjectId})
    userId: Types.ObjectId;

    @Prop({required: true})
    expiresAt: Date;

    @Prop({ default: false})
    isRevoked: boolean;

    @Prop({default: Date.now})
    createdAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });