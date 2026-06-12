import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

type CurrentUserContext = {
  id: string;
  role: UserRole | string;
  organizationId?: string | null;
};

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterOrganizationDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            legalName: registerDto.legalName,
            tradeName: registerDto.tradeName,
            email: registerDto.email,
            phone: registerDto.phone,
            cnpj: registerDto.cnpj,
            description: registerDto.description,
            city: registerDto.city,
            state: registerDto.state,
          },
        });

        const user = await tx.user.create({
          data: {
            fullName: registerDto.fullName,
            email: registerDto.email,
            password: hashedPassword,
            phone: registerDto.phone,
            role: UserRole.ONG_ADMIN,
            organizationId: organization.id,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            organizationId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return { user, organization };
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async create(createOrganizationDto: CreateOrganizationDto, currentUser?: CurrentUserContext) {
    try {
      if (currentUser?.role === UserRole.ONG_ADMIN) {
        const user = await this.prisma.user.findUnique({
          where: { id: currentUser.id },
          select: { organizationId: true },
        });

        if (user?.organizationId) {
          throw new BadRequestException('User already has an organization.');
        }

        return await this.prisma.$transaction(async (tx) => {
          const organization = await tx.organization.create({
            data: createOrganizationDto,
          });

          await tx.user.update({
            where: { id: currentUser.id },
            data: { organizationId: organization.id },
          });

          return organization;
        });
      }

      return await this.prisma.organization.create({ data: createOrganizationDto });
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" was not found.`);
    }

    return organization;
  }

  async findMine(currentUser: CurrentUserContext) {
    const organizationId = await this.resolveUserOrganizationId(currentUser);
    return this.findOne(organizationId);
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto, currentUser?: CurrentUserContext) {
    await this.ensureOrganizationExists(id);
    await this.ensureCanManageOrganization(id, currentUser);

    try {
      return await this.prisma.organization.update({
        where: { id },
        data: updateOrganizationDto,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async updateMine(currentUser: CurrentUserContext, updateOrganizationDto: UpdateOrganizationDto) {
    const organizationId = await this.resolveUserOrganizationId(currentUser);
    return this.update(organizationId, updateOrganizationDto, currentUser);
  }

  async remove(id: string, currentUser?: CurrentUserContext) {
    await this.ensureOrganizationExists(id);
    await this.ensureCanManageOrganization(id, currentUser);

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  private async ensureOrganizationExists(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" was not found.`);
    }
  }

  private async ensureCanManageOrganization(
    organizationId: string,
    currentUser?: CurrentUserContext,
  ) {
    if (!currentUser || currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role !== UserRole.ONG_ADMIN) {
      throw new ForbiddenException('Voce nao tem permissao para alterar esta organizacao.');
    }

    const userOrganizationId = await this.resolveUserOrganizationId(currentUser);

    if (userOrganizationId !== organizationId) {
      throw new ForbiddenException('Voce nao tem permissao para alterar esta organizacao.');
    }
  }

  private async resolveUserOrganizationId(currentUser: CurrentUserContext) {
    if (currentUser.organizationId) {
      return currentUser.organizationId;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      throw new NotFoundException('Organization for current user was not found.');
    }

    return user.organizationId;
  }

  private handleUniqueConstraint(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        throw new BadRequestException('Email is already in use.');
      }

      if (target.includes('cnpj')) {
        throw new BadRequestException('CNPJ is already in use.');
      }

      throw new BadRequestException('Unique field already exists for organization.');
    }
  }
}
