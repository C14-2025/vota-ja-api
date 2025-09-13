# Guia de Testes

Este projeto usa Jest como framework de testes, configurado especificamente para aplicações NestJS.

## Scripts Disponíveis

- `npm test` - Executa todos os testes
- `npm run test:watch` - Executa testes em modo watch (re-executa quando arquivos são alterados)
- `npm run test:coverage` - Executa testes e gera relatório de cobertura
- `npm run test:debug` - Executa testes em modo debug
- `npm run test:e2e` - Executa apenas testes end-to-end

## Estrutura de Testes

```
tests/
├── setup.ts                    # Configuração global para testes
├── jest-e2e.json              # Configuração específica para testes e2e
├── unit/                       # Testes unitários
│   ├── controllers/
│   ├── services/
│   └── ...
└── e2e/                        # Testes end-to-end
    └── app.e2e-spec.ts
```

## Convenções

### Nomenclatura
- Testes unitários: `*.spec.ts`
- Testes e2e: `*.e2e-spec.ts`

### Organização
- Testes unitários devem espelhar a estrutura do diretório `src/`
- Testes e2e ficam no diretório `tests/e2e/`

## Configuração

### Jest Principal (`jest.config.js`)
- Configurado para TypeScript com `ts-jest`
- Mapeamento de aliases para imports
- Configuração de cobertura
- Setup global

### Jest E2E (`tests/jest-e2e.json`)
- Configuração específica para testes de integração
- Timeout maior para operações de rede
- Mesmo mapeamento de aliases

## Exemplos

### Teste Unitário
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import MyService from '../../../src/domain/services/my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Teste E2E
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import AppModule from '../../src/nestjs/modules/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);
  });
});
```

## Mocks e Spies

O Jest oferece poderosas funcionalidades de mock:

```typescript
// Mock de função
const mockFunction = jest.fn();

// Mock de módulo
jest.mock('../path/to/module');

// Spy em método
const spy = jest.spyOn(object, 'method');
```

## Cobertura de Código

O relatório de cobertura é gerado em `./coverage/` e inclui:
- Relatório em HTML (navegável)
- Relatório LCOV (para CI/CD)
- Saída em texto no terminal

## Aliases de Importação

Os seguintes aliases estão configurados:
- `@/` → `src/`
- `@config/` → `src/config/`
- `@domain/` → `src/domain/`
- `@nestjs/` → `src/nestjs/`

## Dicas

1. **Sempre limpe mocks**: Os mocks são automaticamente limpos após cada teste
2. **Use describes aninhados**: Organize testes por funcionalidade
3. **Teste casos extremos**: Não esqueça de testar inputs inválidos
4. **Mantenha testes rápidos**: Testes unitários devem ser executados rapidamente
5. **Use beforeEach/afterEach**: Para setup e cleanup consistentes
