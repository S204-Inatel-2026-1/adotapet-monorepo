import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new ONG account and organization' })
  register(@Body() registerDto: RegisterOrganizationDto) {
    return this.organizationsService.register(registerDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ONG_ADMIN)
  @ApiOperation({ summary: 'Create a new organization' })
  create(@Body() createOrganizationDto: CreateOrganizationDto, @CurrentUser() user: any) {
    return this.organizationsService.create(createOrganizationDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find organization linked to logged user' })
  findMine(@CurrentUser() user: any) {
    return this.organizationsService.findMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find organization by id' })
  @ApiParam({ name: 'id', description: 'Organization cuid id' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization linked to logged user' })
  updateMine(@CurrentUser() user: any, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.updateMine(user, updateOrganizationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ONG_ADMIN)
  @ApiOperation({ summary: 'Update organization by id' })
  @ApiParam({ name: 'id', description: 'Organization cuid id' })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ONG_ADMIN)
  @ApiOperation({ summary: 'Delete organization by id' })
  @ApiParam({ name: 'id', description: 'Organization cuid id' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.organizationsService.remove(id, user);
  }
}
