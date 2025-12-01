import {
  Controller,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import VoteResponseDTO from '~/infra/dtos/vote/VoteResponseDTO';
import VoteCreateDTO from '~/infra/dtos/vote/VoteCreateDTO';
import ApiCommonResponses from '~/infra/swagger/swagger-common-responses.decorator';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import VoteService from '../services/vote.service';

@ApiTags('votes')
@Controller('/polls')
export default class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':pollId/vote')
  @ApiParam({
    name: 'pollId',
    description: 'The ID of the poll to vote on',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Vote successfully registered',
    type: VoteResponseDTO,
  })
  @ApiCommonResponses({ unauthorized: true, forbidden: false })
  async vote(
    @Request() req,
    @Param('pollId') pollId: string,
    @Body() body: VoteCreateDTO,
  ): Promise<VoteResponseDTO> {
    return this.voteService.createVote(req.user.id, pollId, body as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':pollId/vote')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'pollId',
    description: 'The ID of the poll to remove vote from',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Vote successfully removed',
  })
  @ApiCommonResponses({ unauthorized: true, forbidden: false })
  async removeVote(
    @Request() req,
    @Param('pollId') pollId: string,
  ): Promise<void> {
    return this.voteService.removeVote(req.user.id, pollId);
  }
}
