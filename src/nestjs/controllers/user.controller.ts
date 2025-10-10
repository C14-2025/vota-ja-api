import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import UserService from '../services/user.service';
import UserResponseDTO from '~/dtos/user/UserResponseDTO';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import ApiCommonResponses from '~/swagger/swagger-common-responses.decorator';

@ApiTags('users')
@Controller('/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export default class UserController {
  constructor(private readonly userService: UserService) {}

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
