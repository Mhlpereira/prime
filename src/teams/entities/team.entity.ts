import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { TeamMember } from "./team-members.entity";

@Schema({ timestamps: true })
export class Team {
    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
    owner: mongoose.Types.ObjectId;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] })
    members: TeamMember[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);