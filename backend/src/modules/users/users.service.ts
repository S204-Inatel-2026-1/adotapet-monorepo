import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    isActive: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: this.safeUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email is already in use.');
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      select: this.safeUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.ensureUserExists(id);

    try {
      const dataToUpdate: Prisma.UserUpdateInput = { ...updateUserDto };

      if (updateUserDto.password) {
        dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: this.safeUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email is already in use.');
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureUserExists(id);

    return this.prisma.user.delete({
      where: { id },
      select: this.safeUserSelect,
    });
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found.`);
    }
  }

  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }
}
