# NextBuy API

API REST desenvolvida com NestJS para gerenciamento de e-commerce.

## Tecnologias

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório e navegue até a pasta do backend:

```bash
cd next-buy-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados PostgreSQL:

- Crie um banco de dados no PostgreSQL
- Configure as variáveis de ambiente no arquivo `src/data-source.ts`:
  - host: localhost
  - port: 5432
  - username: seu_usuario
  - password: sua_senha
  - database: nome_do_banco

## Executando o projeto

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

## Endpoints Principais

### Autenticação
- POST `/auth/login` - Login de cliente
- POST `/auth/register` - Registro de novo cliente

### Produtos
- GET `/produtos` - Listar produtos
- GET `/produtos/:id` - Detalhes do produto
- POST `/produtos` - Criar produto (admin)

### Categorias
- GET `/categorias` - Listar categorias
- GET `/categorias/:id` - Detalhes da categoria

### Pedidos
- GET `/pedidos` - Listar pedidos do cliente autenticado
- POST `/pedidos` - Criar novo pedido
- POST `/pedidos/:id/itens` - Adicionar item ao pedido
- POST `/pedidos/:id/finalizar` - Finalizar pedido

### Endereços
- GET `/enderecos` - Listar endereços do cliente
- POST `/enderecos` - Cadastrar novo endereço
- PUT `/enderecos/:id` - Atualizar endereço
- DELETE `/enderecos/:id` - Remover endereço

## Documentação da API

Após iniciar o servidor, acesse a documentação Swagger em:
```
http://localhost:3000/api
```
