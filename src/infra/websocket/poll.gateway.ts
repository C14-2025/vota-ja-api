import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class PollGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ping')
  handlePing(@MessageBody() msg: string, @ConnectedSocket() client: Socket) {
    client.emit('pong', msg);
    return { event: 'pong', data: msg };
  }

  @SubscribeMessage('joinPoll')
  handleJoinPoll(
    @MessageBody() pollId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`poll-${pollId}`);
    return { event: 'joinedPoll', data: pollId };
  }

  emitPollUpdate(pollId: string, data: any) {
    this.server.to(`poll-${pollId}`).emit('pollUpdated', data);
  }
}
