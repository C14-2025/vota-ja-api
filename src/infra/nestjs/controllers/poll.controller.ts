import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import PollService from '../services/poll.service';
import PollResponseDTO from '~/infra/dtos/poll/PollResponseDTO';
import PollWithVotesResponseDTO from '~/infra/dtos/poll/PollWithVotesResponseDTO';
import PollCreateDTO from '~/infra/dtos/poll/PollCreateDTO';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import OptionalJwtAuthGuard from '../auth/optional-jwt-auth.guard';
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
    return this.pollService.createPoll(req.user.id, body);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the poll to retrieve',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Get poll by ID with vote counts',
    type: PollWithVotesResponseDTO,
  })
  @ApiCommonResponses({ unauthorized: true, forbidden: false })
  async getPollById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<PollWithVotesResponseDTO> {
    const userId = req.user?.id;
    return this.pollService.getPollById(id, userId);
  }
}
