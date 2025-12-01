import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import AuthResponseDTO from '~/infra/dtos/auth/AuthResponseDTO';
import AuthLoginDTO from '~/infra/dtos/auth/AuthLoginDTO';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';
import LocalAuthGuard from '../auth/local-auth.guard';
import AuthorizationService from '../services/auth.service';

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
