# Vota Já API

API para sistema de votação desenvolvida com NestJS, TypeORM e PostgreSQL.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js para construção de aplicações server-side eficientes e escaláveis
- **TypeORM** - ORM para TypeScript e JavaScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Swagger** - Documentação automática da API
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- NPM ou Yarn
- PostgreSQL
- Docker (opcional)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone <repository-url>
cd vota-ja-api
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados
```bash
npm run migration:run
```

5. Inicie a aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Endpoints da API

### Autenticação

#### POST /auth/login
Realiza login no sistema e retorna um token JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "user@example.com"
  }
}
```

### Usuários

#### GET /users/:id
Busca um usuário pelo ID. Requer autenticação.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "lastLogin": "2023-10-10T10:00:00.000Z",
  "createdAt": "2023-10-01T10:00:00.000Z",
  "updatedAt": "2023-10-10T10:00:00.000Z"
}
```

**Possíveis respostas:**
- `200` - Usuário encontrado
- `401` - Token de autenticação inválido ou ausente
- `404` - Usuário não encontrado

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes end-to-end
npm run test:e2e
```

## 📖 Documentação

A documentação completa da API está disponível via Swagger em:
```
http://localhost:3000/api/docs
```

## 🛠️ Estrutura do Projeto

```
src/
├── config/              # Configurações da aplicação
├── cryptography/        # Utilitários de criptografia
├── databases/           # Modelos e repositórios do banco
├── domain/              # Entidades e interfaces de domínio
├── dtos/                # Data Transfer Objects
├── nestjs/              # Módulos, controllers e services do NestJS
│   ├── auth/           # Guardas e estratégias de autenticação
│   ├── controllers/    # Controllers da API
│   ├── exceptions/     # Filtros de exceção personalizados
│   ├── modules/        # Módulos do NestJS
│   └── services/       # Services da aplicação
└── swagger/            # Configurações do Swagger
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login via `POST /auth/login`
2. Use o `accessToken` retornado no header `Authorization: Bearer <token>`

## 🚀 Deploy

### Docker

```bash
# Construir a imagem
docker build -t vota-ja-api .

# Executar com docker-compose
docker-compose up -d
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
