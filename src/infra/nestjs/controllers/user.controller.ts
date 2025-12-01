import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import UserResponseDTO from '~/infra/dtos/user/UserResponseDTO';
import UserCreateDTO from '~/infra/dtos/user/UserCreateDTO';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import UserService from '../services/user.service';

@ApiTags('users')
@Controller('/users')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a new user',
    type: UserResponseDTO,
  })
  async createUser(@Body() body: UserCreateDTO): Promise<UserResponseDTO> {
    return this.userService.createUser(body as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({
    description: 'List all users',
    type: UserResponseDTO,
    isArray: true,
  })
  async getAllUsers(): Promise<UserResponseDTO[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/:id')
  @ApiOkResponse({
    description: 'Get user by ID',
    type: UserResponseDTO,
  })
  @ApiCommonResponses({ unauthorized: true, forbidden: false })
  async getUserById(@Param('id') id: string): Promise<UserResponseDTO> {
    return this.userService.getUserById(id);
  }
}
