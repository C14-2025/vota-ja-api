import { Test, TestingModule } from '@nestjs/testing';
import AppController from '../../../src/nestjs/controllers/app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health check', () => {
    it('should return OK message', () => {
      const result = controller.async();
      expect(result).toEqual({ message: 'OK' });
    });
  });
});
