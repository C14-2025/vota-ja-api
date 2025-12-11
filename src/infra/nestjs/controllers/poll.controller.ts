import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import PollResponseDTO from '~/infra/dtos/poll/PollResponseDTO';
import PollWithVotesResponseDTO from '~/infra/dtos/poll/PollWithVotesResponseDTO';
import PollCreateDTO from '~/infra/dtos/poll/PollCreateDTO';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';
import Poll from '~/domain/entities/Poll';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import OptionalJwtAuthGuard from '../auth/optional-jwt-auth.guard';
import PollService from '../services/poll.service';

@ApiTags('polls')
@Controller('/polls')
export default class PollController {
  constructor(private readonly pollService: PollService) { }

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/close')
  @ApiOkResponse({ description: 'Poll closed successfully' })
  @ApiCommonResponses({ unauthorized: true, forbidden: true })
  async closePoll(@Request() req, @Param('id') id: string): Promise<void> {
    return this.pollService.closePoll(id, req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by title and description',
  })
  @ApiOkResponse({
    description: 'List all polls with pagination',
    type: Poll,
    isArray: true,
  })
  async getAllPolls(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search: string,
    @Request() req,
  ): Promise<Pagination<Poll>> {
    const userId = req.user?.id;
    return this.pollService.getAllPolls({ page, limit }, search, userId);
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
