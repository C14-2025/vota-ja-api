import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import AuthorizationService from '../services/auth.service';
import AuthResponseDTO from '~/infra/dtos/auth/AuthResponseDTO';
import AuthLoginDTO from '~/infra/dtos/auth/AuthLoginDTO';
import LocalAuthGuard from '../auth/local-auth.guard';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';

@ApiTags('auth')
@Controller('/auth')
export default class AuthController {
  constructor(private authService: AuthorizationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiCreatedResponse({
    description: 'Send credentials to receive accessToken (Bearer Token)',
    isArray: false,
    type: AuthResponseDTO,
  })
  @ApiCommonResponses({ unauthorized: false, forbidden: false })
  async login(@Body() body: AuthLoginDTO): Promise<AuthResponseDTO> {
    return this.authService.login(body);
  }
}
