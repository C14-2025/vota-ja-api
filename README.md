# Vota Já API

API para um sistema de votação em tempo real, desenvolvida com NestJS, TypeORM e PostgreSQL. O sistema permite a autenticação de usuários, criação de enquetes (públicas e privadas), votação e atualização de resultados em tempo real através de WebSockets.

## ✨ Funcionalidades

-   **Autenticação JWT:** Sistema de login seguro baseado em JSON Web Tokens.
-   **Gerenciamento de Usuários:** Criação e consulta de usuários.
-   **Criação de Enquetes:** Suporte para enquetes públicas e privadas com múltiplas opções.
-   **Sistema de Votação:** Permite que usuários autenticados votem e removam seus votos.
-   **Resultados em Tempo Real:** Atualizações instantâneas dos resultados da enquete via WebSockets para clientes conectados.
-   **Paginação e Busca:** Listagem de enquetes com suporte para paginação e busca por texto.
-   **Documentação da API:** Documentação automática e interativa com Swagger.
-   **Testes:** Suítes completas de testes unitários e end-to-end.
-   **Containerização:** Configuração para rodar a aplicação e o banco de dados com Docker.

## 🚀 Tecnologias Utilizadas

-   **Backend:** [NestJS](https://nestjs.com/), [Node.js](https://nodejs.org/)
-   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
-   **ORM:** [TypeORM](https://typeorm.io/)
-   **Autenticação:** [Passport.js](http://www.passportjs.org/) (Estratégias `jwt` e `local`)
-   **WebSockets:** [Socket.IO](https://socket.io/)
-   **Testes:** [Jest](https://jestjs.io/), [Supertest](https://github.com/visionmedia/supertest), [Testcontainers](https://testcontainers.com/)
-   **Documentação:** [Swagger (OpenAPI)](https://swagger.io/)
-   **Containerização:** [Docker](https://www.docker.com/)

## 🔧 Instalação e Execução

### Pré-requisitos

-   Node.js (v20.x ou superior)
-   NPM ou Yarn
-   Docker (recomendado para o banco de dados)

### 1. Clonar o Repositório

```bash
git clone https://github.com/c14-2025/vota-ja-api.git
cd vota-ja-api
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie uma cópia do arquivo de exemplo `.env.example` e renomeie para `.env`.

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do seu ambiente local. As variáveis do arquivo `.env.test` são um bom guia para as chaves necessárias:

```dotenv
# Throttler (Rate Limiting)
THROTTLER_TTL=60000
THROTTLER_LIMIT=100

# Environment
ENV=local # ou development, production, testing

# JWT Keys (use chaves RSA geradas em Base64)
JWT_PRIVATE_KEY="YOUR_BASE64_ENCODED_PRIVATE_KEY"
JWT_PUBLIC_KEY="YOUR_BASE64_ENCODED_PUBLIC_KEY"

# Database Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=test
POSTGRES_PASS=test
POSTGRES_DB_NAME=test
TYPEORM_SYNCHRONIZE=true
```

### 4. Executar o Banco de Dados com Docker

A forma mais fácil de subir o PostgreSQL é usando o `docker-compose.yml` do projeto:

```bash
docker-compose up -d
```

### 5. Iniciar a Aplicação

A aplicação irá sincronizar o schema do banco de dados automaticamente se `TYPEORM_SYNCHRONIZE` estiver como `true`.

```bash
# Modo de desenvolvimento com watch
npm run start:dev
```

A API estará disponível em `http://localhost:5000`.

## 🧪 Testes

O projeto conta com testes unitários para a lógica de domínio e testes end-to-end que simulam o uso real da API com um banco de dados em container.

```bash
# Executar testes unitários
npm run test:unit

# Executar testes end-to-end (requer Docker)
npm run test:e2e

# Executar todos os testes e gerar relatório de cobertura
npm run test:coverage
```

## 📖 Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada em:

➡️ **[http://localhost:5000/docs](http://localhost:5000/docs)**

### Endpoints Principais

-   `POST /users` - Cria um novo usuário.
-   `POST /auth/login` - Autentica um usuário e retorna um token JWT.
-   `GET /polls` - Lista enquetes (enquetes públicas para todos, todas para usuários autenticados).
-   `POST /polls` - Cria uma nova enquete (requer autenticação).
-   `GET /polls/:id` - Obtém detalhes de uma enquete específica.
-   `PATCH /polls/:pollId/vote` - Registra um voto em uma enquete (requer autenticação).
-   `DELETE /polls/:pollId/vote` - Remove o voto de um usuário de uma enquete (requer autenticação).

## 📡 WebSockets (Atualizações em Tempo Real)

A API notifica os clientes sobre novos votos ou remoção de votos em tempo real.

1.  **Conectar ao Servidor:** Conecte-se ao servidor WebSocket na URL base da sua aplicação (ex: `http://localhost:5000`).
2.  **Entrar na Sala da Enquete:** Para receber atualizações de uma enquete específica, emita o evento `joinPoll` com o ID da enquete como payload.
    ```javascript
    socket.emit('joinPoll', 'poll-id-aqui');
    ```
3.  **Ouvir Atualizações:** Ouça o evento `pollUpdated` para receber os dados atualizados da votação.
    ```javascript
    socket.on('pollUpdated', (data) => {
      console.log('A enquete foi atualizada!', data);
      // data: { pollId, optionId, totalVotes, optionVotes, percentage }
    });
    ```

## 🏗️ Estrutura do Projeto

O projeto segue princípios de Clean Architecture para separar a lógica de negócio (domínio) dos detalhes de infraestrutura (framework, banco de dados).

```
src/
├── domain/             # Lógica de negócio, entidades e casos de uso (agnóstico de framework)
│   ├── entities/       # Entidades do domínio (User, Poll, Vote, etc.)
│   ├── use-cases/      # Casos de uso que orquestram a lógica de negócio
│   ├── interfaces/     # Contratos (interfaces) para repositórios e DTOs
│   └── errors/         # Erros de domínio customizados
└── infra/              # Implementações de framework e bibliotecas externas
    ├── nestjs/         # Módulos, controllers e services do NestJS
    ├── databases/      # Modelos e repositórios do TypeORM
    ├── cryptography/   # Implementações para hash (bcrypt) e JWT
    ├── websocket/      # Gateway e adaptadores para Socket.IO
    └── config/         # Configuração da aplicação (ambiente, TypeORM, etc.)
```

## 🔄 CI/CD

-   **GitHub Actions:** Executa os testes unitários (`npm run test:unit`) a cada push ou pull request nas branches `main` e `develop`.
-   **Jenkins:** O `Jenkinsfile` está configurado para orquestrar a execução dos testes end-to-end (`npm run test:e2e`).