import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('healthcheck')
@Controller('/')
export default class AppController {
  @ApiOkResponse({ description: 'Healthcheck', isArray: false, type: Object })
  @Get('/health')
  async(): { message: string } {
    return { message: 'OK' };
  }
}
