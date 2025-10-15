import { Schema } from "@nestjs/mongoose";

@Schema({ collection: 'refresh_tokens'})
export class RefreshToken extends Document {
    
}