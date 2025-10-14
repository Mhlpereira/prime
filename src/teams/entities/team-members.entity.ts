import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";
import { TeamRole } from "src/types/team-role"


@Schema()
export class TeamMember{
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    user: mongoose.Types.ObjectId;

    @Prop({
        type: String,
        enum: TeamRole,
        default: TeamRole.STUDENT
    })
    role: TeamRole;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);