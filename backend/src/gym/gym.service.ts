import { Injectable } from '@nestjs/common';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GymService {
  constructor(private prisma: PrismaService) {}

  async create(createGymDto: CreateGymDto, ownerId: string) {
    return this.prisma.gym.create({
      data: {
        name: createGymDto.name,
        description: createGymDto.description,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  findAll() {
    return `This action returns all gym`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gym`;
  }

  update(id: number, updateGymDto: UpdateGymDto) {
    return `This action updates a #${id} gym`;
  }

  remove(id: number) {
    return `This action removes a #${id} gym`;
  }
}
