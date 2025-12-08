import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GymService } from './gym.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/current-user.decorator';

@Controller('gym')
@UseGuards(JwtAuthGuard)
export class GymController {
  constructor(private readonly gymService: GymService) {}

  @Post()
  create(
    @Body() createGymDto: CreateGymDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.gymService.create(createGymDto, userId);
  }

  @Get()
  findAll() {
    return this.gymService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gymService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return this.gymService.update(+id, updateGymDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gymService.remove(+id);
  }
}
