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

## Modelo de Dados

### Cliente
- id (UUID)
- nome (string)
- email (string, único)
- senha (string, criptografada)
- cpf (string, único)
- telefone (string)
- Relacionamentos: possui múltiplos Endereços e Pedidos

### Produto
- id (UUID)
- nome (string)
- descricao (string)
- preco (decimal)
- estoque (number)
- imagem (string, URL)
- ativo (boolean)
- categoriaId (UUID)
- Relacionamentos: pertence a uma Categoria

### Categoria
- id (UUID)
- nome (string)
- descricao (string)
- Relacionamentos: possui múltiplos Produtos

### Endereco
- id (UUID)
- cep (string)
- rua (string)
- numero (string)
- complemento (string, opcional)
- bairro (string)
- cidade (string)
- estado (string)
- isDefault (boolean)
- clienteId (UUID)
- Relacionamentos: pertence a um Cliente

### Pedido
- id (UUID)
- status (enum: ABERTO, PAGO, CANCELADO)
- subtotal (decimal)
- total (decimal)
- quantidadeTotal (number)
- createdAt (timestamp)
- clienteId (UUID)
- Relacionamentos: pertence a um Cliente, possui múltiplos ItemPedido e um Pagamento

### ItemPedido
- id (UUID)
- quantidade (number)
- precoUnitario (decimal)
- subtotal (decimal)
- pedidoId (UUID)
- produtoId (UUID)
- Relacionamentos: pertence a um Pedido e referencia um Produto

### Pagamento
- id (UUID)
- metodo (enum: PIX, CARTAO_CREDITO, CARTAO_DEBITO, DINHEIRO)
- valor (decimal)
- status (enum: PENDENTE, PAGO, CANCELADO)
- data (timestamp)
- pedidoId (UUID)
- Relacionamentos: pertence a um Pedido

## Regras de Negócio

### Autenticação e Segurança
- Sistema de autenticação com JWT
- Senhas criptografadas antes de armazenar no banco
- Token JWT obrigatório em todas as rotas (exceto login e registro)
- Clientes só podem acessar e modificar seus próprios recursos
- Validação de ownership em todas as operações de pedidos e endereços

### Gerenciamento de Produtos
- Produtos inativos não aparecem na listagem
- Validação de estoque antes de adicionar itens ao pedido
- Apenas produtos ativos podem ser adicionados ao carrinho
- Estoque não pode ser negativo

### Processo de Pedidos
- Pedido criado com status ABERTO
- Itens só podem ser adicionados a pedidos com status ABERTO
- Cálculo automático de subtotais e total do pedido
- Validação de estoque disponível antes de finalizar

### Finalização de Pedido
- Valida estoque de todos os itens antes de finalizar
- Se estoque insuficiente, pedido não é finalizado
- Ao finalizar:
  - Estoque dos produtos é debitado automaticamente
  - Status do pedido muda para PAGO
  - Pagamento é registrado com status PAGO
- Pedidos com status PAGO não podem ser modificados
- Transações de banco garantem integridade dos dados

### Gerenciamento de Estoque
- Estoque só é debitado na finalização do pedido
- Operações de estoque usam transações para garantir consistência
- Validação de estoque em cada etapa do processo

### Endereços
- Cliente pode ter múltiplos endereços
- Apenas um endereço pode ser marcado como padrão
- Validação de campos obrigatórios (CEP, rua, número, cidade, estado)
- Cliente só pode acessar e modificar seus próprios endereços

### Pagamentos
- Pagamento criado apenas na finalização do pedido
- Valor do pagamento sempre corresponde ao total do pedido
- Um pedido possui apenas um pagamento
- Status de pagamento sincronizado com status do pedido

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
