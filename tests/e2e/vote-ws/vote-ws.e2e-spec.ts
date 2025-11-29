import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';

describe('Poll WebSocket E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let pollId: string;
  let optionId: string;
  let serverUrl: string;

  beforeAll(async () => {
    app = await TestAppFactory.create();
    await app.listen(0);

    const port = app.getHttpServer().address().port;
    serverUrl = `http://localhost:${port}`;

    // Registrar e autenticar usuário para os testes
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'WebSocket Test User',
        email: 'wstest@example.com',
        password: 'Password123',
      })
      .expect(201);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wstest@example.com',
        password: 'Password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    // Criar uma enquete com o formato correto
    const pollResponse = await request(app.getHttpServer())
      .post('/polls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Qual a melhor linguagem de programação?',
        description: 'Votação para escolher a melhor linguagem',
        type: 'public',
        options: ['TypeScript', 'JavaScript', 'Python', 'Go'],
      })
      .expect(201);

    pollId = pollResponse.body.id;
    optionId = pollResponse.body.options[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('WebSocket Connection', () => {
    let client: Socket;

    afterEach(done => {
      if (client?.connected) {
        client.removeAllListeners();
        client.disconnect();
      }
      setTimeout(done, 100);
    });

    it('should connect to websocket server', done => {
      client = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Connection timeout'));
      }, 5000);

      client.once('connect', () => {
        clearTimeout(timeout);
        expect(client.connected).toBe(true);
        done();
      });

      client.once('connect_error', err => {
        clearTimeout(timeout);
        done(err);
      });
    });

    it('should respond to ping with pong', done => {
      client = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Ping timeout'));
      }, 5000);

      client.once('connect', () => {
        client.once('pong', (data: any) => {
          clearTimeout(timeout);
          expect(data).toBe('test message');
          done();
        });

        client.emit('ping', 'test message');
      });

      client.once('connect_error', err => {
        clearTimeout(timeout);
        done(err);
      });
    });
  });

  describe('Join Poll Room', () => {
    let client: Socket;

    afterEach(done => {
      if (client?.connected) {
        client.removeAllListeners();
        client.disconnect();
      }
      setTimeout(done, 100);
    });

    it('should join a poll room successfully', done => {
      client = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Join poll timeout'));
      }, 5000);

      client.once('connect', () => {
        client.once('joinedPoll', (data: any) => {
          clearTimeout(timeout);
          expect(data).toBe(pollId);
          done();
        });

        client.emit('joinPoll', pollId);
      });

      client.once('connect_error', err => {
        clearTimeout(timeout);
        done(err);
      });
    });

    it('should allow multiple clients to join the same poll room', done => {
      const client1 = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });
      const client2 = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      let joined = 0;
      const timeout = setTimeout(() => {
        done(new Error('Join poll timeout'));
      }, 5000);

      const cleanup = () => {
        client1.removeAllListeners();
        client2.removeAllListeners();
        if (client1.connected) client1.disconnect();
        if (client2.connected) client2.disconnect();
      };

      const checkJoined = () => {
        joined++;
        if (joined === 2) {
          clearTimeout(timeout);
          cleanup();
          done();
        }
      };

      client1.once('connect', () => {
        client1.once('joinedPoll', (data: any) => {
          expect(data).toBe(pollId);
          checkJoined();
        });
        client1.emit('joinPoll', pollId);
      });

      client2.once('connect', () => {
        client2.once('joinedPoll', (data: any) => {
          expect(data).toBe(pollId);
          checkJoined();
        });
        client2.emit('joinPoll', pollId);
      });

      client1.once('connect_error', err => {
        clearTimeout(timeout);
        cleanup();
        done(err);
      });

      client2.once('connect_error', err => {
        clearTimeout(timeout);
        cleanup();
        done(err);
      });
    });
  });

  describe('Poll Updates via WebSocket', () => {
    let client1: Socket;
    let client2: Socket;

    afterEach(done => {
      if (client1?.connected) {
        client1.removeAllListeners();
        client1.disconnect();
      }
      if (client2?.connected) {
        client2.removeAllListeners();
        client2.disconnect();
      }
      setTimeout(done, 100);
    });

    it('should broadcast pollUpdated event when a vote is created', done => {
      client1 = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('pollUpdated event not received'));
      }, 10000);

      client1.once('connect', () => {
        // Configura listener para o evento
        client1.once('pollUpdated', (data: any) => {
          clearTimeout(timeout);
          expect(data).toMatchObject({
            pollId,
            optionId,
          });
          expect(data.totalVotes).toBeGreaterThanOrEqual(1);
          expect(data.optionVotes).toBeGreaterThanOrEqual(1);
          expect(data.percentage).toBeGreaterThanOrEqual(0);
          done();
        });

        // Primeiro entra na sala
        client1.once('joinedPoll', () => {
          // Então vota
          request(app.getHttpServer())
            .patch(`/polls/${pollId}/vote`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ optionId })
            .catch(err => {
              clearTimeout(timeout);
              done(err);
            });
        });

        client1.emit('joinPoll', pollId);
      });

      client1.once('connect_error', err => {
        clearTimeout(timeout);
        done(err);
      });
    });

    it('should broadcast to all clients in the poll room', async () => {
      // Criar usuário único para este teste
      const uniqueEmail = `broadcast-test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Broadcast Test User',
          email: uniqueEmail,
          password: 'Password123',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail, password: 'Password123' })
        .expect(201);

      const testToken = loginRes.body.accessToken;

      return new Promise<void>((resolve, reject) => {
        client1 = io(serverUrl, {
          transports: ['websocket'],
          reconnection: false,
        });
        client2 = io(serverUrl, {
          transports: ['websocket'],
          reconnection: false,
        });

        const timeout = setTimeout(() => {
          reject(new Error('Not all clients received the update'));
        }, 10000);

        let receivedUpdates = 0;
        let clientsJoined = 0;

        const checkUpdate = (data: any) => {
          expect(data).toMatchObject({ pollId, optionId });
          receivedUpdates++;
          if (receivedUpdates === 2) {
            clearTimeout(timeout);
            resolve();
          }
        };

        const checkJoined = () => {
          clientsJoined++;
          if (clientsJoined === 2) {
            // Ambos entraram, agora pode votar
            request(app.getHttpServer())
              .patch(`/polls/${pollId}/vote`)
              .set('Authorization', `Bearer ${testToken}`)
              .send({ optionId })
              .catch(err => {
                clearTimeout(timeout);
                reject(err);
              });
          }
        };

        client1.once('connect', () => {
          client1.once('pollUpdated', checkUpdate);
          client1.once('joinedPoll', checkJoined);
          client1.emit('joinPoll', pollId);
        });

        client2.once('connect', () => {
          client2.once('pollUpdated', checkUpdate);
          client2.once('joinedPoll', checkJoined);
          client2.emit('joinPoll', pollId);
        });
      });
    });

    it('should NOT broadcast to clients NOT in the poll room', async () => {
      // Criar usuário único para este teste
      const uniqueEmail = `no-broadcast-test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'No Broadcast Test User',
          email: uniqueEmail,
          password: 'Password123',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail, password: 'Password123' })
        .expect(201);

      const testToken = loginRes.body.accessToken;

      return new Promise<void>((resolve, reject) => {
        client1 = io(serverUrl, {
          transports: ['websocket'],
          reconnection: false,
        });
        client2 = io(serverUrl, {
          transports: ['websocket'],
          reconnection: false,
        });

        const timeout = setTimeout(() => {
          reject(new Error('Test timeout'));
        }, 10000);

        const differentPollRoom = 'different-poll-id-12345';
        let client2ReceivedUpdate = false;

        client1.once('connect', () => {
          client1.once('pollUpdated', (data: any) => {
            expect(data.pollId).toBe(pollId);

            // Aguardar para garantir que client2 não recebeu
            setTimeout(() => {
              clearTimeout(timeout);
              expect(client2ReceivedUpdate).toBe(false);
              resolve();
            }, 2000);
          });

          client1.once('joinedPoll', () => {
            // Client1 entrou, agora vota
            request(app.getHttpServer())
              .patch(`/polls/${pollId}/vote`)
              .set('Authorization', `Bearer ${testToken}`)
              .send({ optionId })
              .catch(err => {
                clearTimeout(timeout);
                reject(err);
              });
          });

          client1.emit('joinPoll', pollId);
        });

        client2.once('connect', () => {
          client2.on('pollUpdated', () => {
            client2ReceivedUpdate = true;
          });
          // Client2 entra em sala diferente
          client2.emit('joinPoll', differentPollRoom);
        });
      });
    });

    it('should broadcast pollUpdated event when a vote is removed', done => {
      client1 = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Vote removal update not received'));
      }, 10000);

      client1.once('connect', () => {
        client1.once('joinedPoll', () => {
          // Primeiro cria o voto
          request(app.getHttpServer())
            .patch(`/polls/${pollId}/vote`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ optionId })
            .then(() => {
              // Aguarda um pouco e configura listener
              setTimeout(() => {
                client1.once('pollUpdated', (data: any) => {
                  clearTimeout(timeout);
                  expect(data).toMatchObject({ pollId, optionId });
                  expect(data.totalVotes).toBeGreaterThanOrEqual(0);
                  done();
                });

                // Remove o voto
                request(app.getHttpServer())
                  .delete(`/polls/${pollId}/vote`)
                  .set('Authorization', `Bearer ${accessToken}`)
                  .catch(err => {
                    clearTimeout(timeout);
                    done(err);
                  });
              }, 500);
            })
            .catch(err => {
              clearTimeout(timeout);
              done(err);
            });
        });

        client1.emit('joinPoll', pollId);
      });
    });

    it('should receive updated percentages when multiple votes exist', async () => {
      // Criar usuário único para este teste
      const uniqueEmail = `multiple-votes-test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Multiple Votes Test User',
          email: uniqueEmail,
          password: 'Password123',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail, password: 'Password123' })
        .expect(201);

      const testToken = loginRes.body.accessToken;

      return new Promise<void>((resolve, reject) => {
        client1 = io(serverUrl, {
          transports: ['websocket'],
          reconnection: false,
        });

        const timeout = setTimeout(() => {
          reject(new Error('Multiple votes test timeout'));
        }, 15000);

        client1.once('connect', () => {
          client1.once('pollUpdated', (data: any) => {
            clearTimeout(timeout);
            expect(data.pollId).toBe(pollId);
            expect(data.totalVotes).toBeGreaterThan(0);
            expect(data.percentage).toBeGreaterThanOrEqual(0);
            expect(data.percentage).toBeLessThanOrEqual(100);
            resolve();
          });

          client1.once('joinedPoll', () => {
            // Usuário único vota
            request(app.getHttpServer())
              .patch(`/polls/${pollId}/vote`)
              .set('Authorization', `Bearer ${testToken}`)
              .send({ optionId })
              .catch(err => {
                clearTimeout(timeout);
                reject(err);
              });
          });

          client1.emit('joinPoll', pollId);
        });
      });
    });
  });

  describe('Connection Error Handling', () => {
    let client: Socket;

    afterEach(done => {
      if (client?.connected) {
        client.removeAllListeners();
        client.disconnect();
      }
      setTimeout(done, 100);
    });

    it('should handle disconnection gracefully', done => {
      client = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Disconnect timeout'));
      }, 5000);

      client.once('connect', () => {
        client.once('disconnect', () => {
          clearTimeout(timeout);
          expect(client.connected).toBe(false);
          done();
        });

        client.disconnect();
      });
    });

    it('should be able to reconnect after disconnection', done => {
      client = io(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        done(new Error('Reconnection timeout'));
      }, 5000);

      client.once('connect', () => {
        client.disconnect();

        setTimeout(() => {
          client.connect();
          client.once('connect', () => {
            clearTimeout(timeout);
            expect(client.connected).toBe(true);
            done();
          });
        }, 200);
      });
    });
  });
});
