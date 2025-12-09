import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { FilterClassDto } from './dto/filter-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/current-user.decorator';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  create(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.create(createClassDto, userId);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() filters?: FilterClassDto,
  ) {
    return this.classService.findAll(userId, filters);
  }

  @Get('team/:teamId')
  findByTeam(
    @Param('teamId') teamId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.findByTeam(teamId, userId);
  }

  @Get('gym/:gymId')
  findByGym(
    @Param('gymId') gymId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.findByGym(gymId, userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.update(id, updateClassDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classService.remove(id, userId);
  }
}
