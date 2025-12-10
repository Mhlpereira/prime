import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common";
import { TeamService } from "./team.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { FilterTeamDto } from "./dto/filter-team.dto";
import { GymRoleGuard } from "../../common/guards/gym-role.guard";
import { CurrentUser } from "../../common/decorator/current-user.decorator";
import { RequireGymRole } from "../../common/decorator/require-gym-role.decorator";
import { Permission } from "../../common/rbac/rbac.constants";

@Controller("team")
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @Post()
    @UseGuards(GymRoleGuard)
    @RequireGymRole({ permissions: [Permission.TEAM_CREATE] })
    create(@Body() createTeamDto: CreateTeamDto, @CurrentUser("sub") userId: string) {
        return this.teamService.create(createTeamDto, userId);
    }

    @Get()
    findAll(@CurrentUser("sub") userId: string, @Query() filters?: FilterTeamDto) {
        return this.teamService.findAll(userId, filters);
    }

    @Get("gym/:gymId")
    findByGym(@Param("gymId") gymId: string, @CurrentUser("sub") userId: string) {
        return this.teamService.findByGym(gymId, userId);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @CurrentUser("sub") userId: string) {
        return this.teamService.findOne(id, userId);
    }

    @Patch(":id")
    @UseGuards(GymRoleGuard)
    @RequireGymRole({ permissions: [Permission.TEAM_UPDATE] })
    update(@Param("id") id: string, @Body() updateTeamDto: UpdateTeamDto, @CurrentUser("sub") userId: string) {
        return this.teamService.update(id, updateTeamDto, userId);
    }

    @Delete(":id")
    @UseGuards(GymRoleGuard)
    @RequireGymRole({ permissions: [Permission.TEAM_DELETE] })
    remove(@Param("id") id: string, @CurrentUser("sub") userId: string) {
        return this.teamService.remove(id, userId);
    }
}
