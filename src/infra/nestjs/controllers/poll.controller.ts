import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import PollService from '../services/poll.service';
import PollResponseDTO from '~/infra/dtos/poll/PollResponseDTO';
import PollCreateDTO from '~/infra/dtos/poll/PollCreateDTO';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';

@ApiTags('polls')
@Controller('/polls')
export default class PollController {
  constructor(private readonly pollService: PollService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({
    description: 'Create a new poll',
    type: PollResponseDTO,
  })
  @ApiCommonResponses({ unauthorized: true, forbidden: false })
  async createPoll(
    @Request() req,
    @Body() body: PollCreateDTO,
  ): Promise<PollResponseDTO> {
    return this.pollService.createPoll(req.user.id, body as any);
  }
}
