# Little Ville - Backend

API REST do Little Ville, responsável por autenticação, autorização, CRUD de avistamentos, comentários e persistência PostgreSQL.

## 1. Stack

- Node.js
- Express 5
- Prisma 7
- PostgreSQL
- `@prisma/adapter-pg`
- `pg`
- bcrypt
- jsonwebtoken
- cors
- dotenv
- tsx
- nodemon

---

# 2. Executando localmente

## Pré-requisitos

- Node.js
- npm
- PostgreSQL

Crie um banco PostgreSQL, por exemplo:

```text
littleville-db
```

## Instalação

```bash
cd backend-littleville
npm install
```

## Variáveis de ambiente

Crie `.env`:

```powershell
Copy-Item .env.example .env
```

Configure:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@localhost:5432/littleville-db?schema=public
PORT=3000
JWT_SECRET=uma-chave-secreta-longa-e-aleatoria
```

Nunca publique o `.env`.

---

# 3. Banco e Prisma

O schema está em:

```text
prisma/schema.prisma
```

A configuração do Prisma está em:

```text
prisma7.config.ts
```

## Aplicar migrations

```bash
npx prisma migrate deploy
```

## Gerar Prisma Client

```bash
npx prisma generate
```

## Seed

Para criar dados de demonstração:

```bash
npx tsx prisma/seed.js
```

Credencial de demonstração:

```text
ana@littleville.com
123456
```

O seed cria usuários, avistamentos e alguns comentários.

---

# 4. Scripts

```json
{
  "dev": "node --watch src/server.js",
  "build": "prisma generate",
  "start": "tsx src/server.js"
}
```

Uso:

```bash
npm run dev
```

para desenvolvimento.

```bash
npm run build
```

para gerar o Prisma Client.

```bash
npm run start
```

para iniciar o servidor.

---

# 5. Estrutura

```text
backend-littleville/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── avistamentoController.js
│   │   └── comentarioController.js
│   ├── lib/
│   │   └── prisma.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── avistamentoRoutes.js
│   └── server.js
├── .env.example
├── package.json
├── prisma7.config.ts
└── tsconfig.json
```

---

# 6. Arquitetura interna

```text
HTTP Request
     │
     ▼
Express Router
     │
     ├── authRoutes
     └── avistamentoRoutes
              │
              ▼
        authMiddleware
        quando necessário
              │
              ▼
         Controller
              │
              ▼
           Prisma
              │
              ▼
        PostgreSQL
```

## Responsabilidades

### Routes

Definem:

- método HTTP;
- caminho;
- middleware;
- controller executado.

### Middleware

O `authMiddleware`:

1. lê `Authorization`;
2. verifica o formato `Bearer <token>`;
3. valida JWT;
4. obtém o ID do usuário;
5. consulta o usuário no banco;
6. disponibiliza o usuário em `req.user`.

### Controllers

Contêm:

- validação dos dados;
- regras de autorização;
- chamadas ao Prisma;
- respostas HTTP.

### Prisma

Abstrai o acesso ao PostgreSQL e mantém as relações definidas no schema.

---

# 7. API

Base local:

```text
http://localhost:3000
```

## 7.1 Autenticação

### POST `/auth/register`

Cria usuário.

Body:

```json
{
  "nome": "Ana Ferreira",
  "email": "ana@example.com",
  "senha": "123456"
}
```

Regras:

- nome obrigatório;
- e-mail obrigatório;
- senha obrigatória;
- senha com pelo menos 6 caracteres;
- e-mail normalizado;
- e-mail único.

Resposta de sucesso:

```http
201 Created
```

A senha não é retornada.

### POST `/auth/login`

Body:

```json
{
  "email": "ana@example.com",
  "senha": "123456"
}
```

Resposta de sucesso:

```http
200 OK
```

Retorna:

```json
{
  "token": "...",
  "usuario": {
    "id": "...",
    "nome": "Ana Ferreira",
    "email": "ana@example.com",
    "createdAt": "..."
  }
}
```

O JWT expira em 1 dia.

### GET `/auth/me`

Requer:

```text
Authorization: Bearer <token>
```

Retorna o usuário autenticado sem senha.

---

# 8. Avistamentos

## GET `/av`

Lista todos os avistamentos.

Não exige autenticação.

A ordenação atual é:

```text
createdAt DESC
```

Ou seja, os registros criados mais recentemente aparecem primeiro.

## GET `/av/:id`

Busca um avistamento pelo ID.

Retorna `404` quando não encontrado.

## POST `/av`

Requer autenticação.

Body:

```json
{
  "titulo": "Vulto na trilha",
  "descricao": "Descrição do avistamento",
  "criatura": "Pé Grande",
  "localizacao": "Trilha da montanha",
  "latitude": -27.7304,
  "longitude": -48.5083,
  "data": "2026-08-02",
  "confianca": 72
}
```

Campos obrigatórios:

- `titulo`
- `descricao`
- `criatura`
- `localizacao`
- `data`
- `confianca`

Campos opcionais:

- `latitude`
- `longitude`

O `userId` não deve ser enviado pelo cliente. O backend utiliza:

```js
req.user.id
```

## PUT `/av/:id`

Requer autenticação.

Permite atualizar os campos do avistamento.

O backend procura o registro utilizando:

```text
id + userId
```

Portanto, somente o proprietário pode alterá-lo.

## DELETE `/av/:id`

Requer autenticação.

Somente o proprietário pode excluir o registro.

Resposta de sucesso:

```http
204 No Content
```

---

# 9. Comentários

## GET `/av/:id/comentarios`

Não exige autenticação.

Lista os comentários em ordem crescente de `createdAt`.

Cada comentário inclui informações do autor:

```json
{
  "id": "...",
  "texto": "Comentário",
  "avistamentoId": "...",
  "userId": "...",
  "createdAt": "...",
  "autor": {
    "id": "...",
    "nome": "Ana Ferreira"
  }
}
```

## POST `/av/:id/comentarios`

Requer autenticação.

Body:

```json
{
  "texto": "Eu também vi algo parecido."
}
```

O texto deve ser uma string não vazia.

O backend aplica `trim()` antes de salvar.

## DELETE `/av/comentarios/:comentarioId`

Requer autenticação.

O backend procura:

```text
comentarioId + req.user.id
```

Assim, apenas o autor pode excluir o comentário.

---

# 10. Status HTTP

Os controllers utilizam principalmente:

| Status | Uso |
|---|---|
| `200` | operação de consulta/atualização bem-sucedida |
| `201` | criação bem-sucedida |
| `204` | exclusão bem-sucedida |
| `400` | dados inválidos ou ausentes |
| `401` | autenticação ausente/inválida |
| `404` | recurso inexistente ou não pertencente ao usuário |
| `409` | e-mail já cadastrado |
| `500` | erro interno |

---

# 11. Modelo de dados

## User

```text
id          String UUID
nome        String
email       String UNIQUE
senha       String
createdAt   DateTime
```

Relações:

```text
User 1:N Avistamento
User 1:N Comentario
```

## Avistamento

```text
id            String UUID
titulo        String
descricao     String
criatura      String
localizacao   String
latitude      Float?
longitude     Float?
data          DateTime
confianca     Int
userId        String FK
createdAt     DateTime
updatedAt     DateTime
```

Índices:

```text
criatura
localizacao
data
```

## Comentario

```text
id             String UUID
texto          String
avistamentoId  String FK
userId         String FK
createdAt      DateTime
```

Índice:

```text
avistamentoId
```

---

# 12. Relações e cascatas

O schema define:

```text
User
 ├── Avistamentos
 └── Comentários

Avistamento
 └── Comentários
```

Com `onDelete: Cascade`:

- excluir usuário exclui seus avistamentos;
- excluir usuário exclui seus comentários;
- excluir avistamento exclui seus comentários.

---

# 13. Autenticação e autorização

## Geração

No login:

1. usuário é encontrado por e-mail;
2. bcrypt compara a senha;
3. JWT é criado;
4. JWT contém `id` e `email`;
5. token expira em 1 dia.

## Validação

O middleware exige:

```text
Authorization: Bearer <token>
```

Depois verifica:

```js
jwt.verify(token, process.env.JWT_SECRET)
```

O usuário é consultado novamente no banco.

Isso permite que `req.user` represente um usuário existente no momento da requisição.

---

# 14. Regras de negócio do backend

### Usuário

- e-mail único;
- e-mail normalizado;
- senha mínima de 6 caracteres;
- senha armazenada com bcrypt;
- senha nunca enviada nas respostas.

### Avistamento

- criação exige autenticação;
- alteração exige autenticação;
- exclusão exige autenticação;
- somente o autor pode alterar;
- somente o autor pode excluir;
- consulta geral não exige autenticação;
- coordenadas podem ser nulas.

### Comentário

- consulta pública;
- criação autenticada;
- texto não pode estar vazio;
- exclusão limitada ao autor;
- comentário exige avistamento existente.

---

# 15. Validações e limitações atuais

O backend possui validações básicas, mas algumas regras ainda não são rigorosamente validadas.

## Confiança

O valor é convertido com:

```js
Number(confianca)
```

A API não verifica explicitamente se o resultado está entre `0` e `100`.

A interface impõe a faixa, mas clientes HTTP podem enviar outros valores.

## Coordenadas

O backend verifica se latitude/longitude podem ser convertidas para número, mas não verifica limites geográficos como:

```text
latitude: -90..90
longitude: -180..180
```

## Datas

A data é convertida com:

```js
new Date(data)
```

Não existe uma validação explícita para todos os formatos ou para datas inválidas.

Esses pontos podem ser tratados em uma evolução futura.

---

# 16. CORS

O backend utiliza `cors()` com origens explícitas:

```text
http://localhost:5173
https://littleville.netlify.app
```

Se o frontend for executado em outro endereço, a origem deverá ser adicionada à configuração do backend.

---

# 17. Deploy

O backend está configurado para o ambiente público utilizado pelo frontend:

```text
https://backend-littleville.onrender.com/
```

Em produção, configure no ambiente do servidor:

```env
DATABASE_URL=...
PORT=...
JWT_SECRET=...
```

O processo de deploy deve:

1. instalar dependências;
2. disponibilizar as variáveis de ambiente;
3. aplicar migrations quando necessário;
4. executar o processo de build;
5. iniciar o servidor.

---

# 18. Migrações

As migrations estão em:

```text
prisma/migrations/
```

A sequência atual registra, entre outras alterações:

1. criação inicial de usuários e avistamentos;
2. mudança dos nomes de campos para português;
3. mudança do campo de data;
4. adição de latitude e longitude;
5. criação de comentários.

Para aplicar migrations existentes:

```bash
npx prisma migrate deploy
```

Para desenvolvimento com alteração do schema, a criação da migration deve ser feita pelo fluxo normal do Prisma e depois versionada no Git.

---

# 19. Seed

Arquivo:

```text
prisma/seed.js
```

Executar:

```bash
npx tsx prisma/seed.js
```

O seed:

- cria três usuários de demonstração;
- cria sete avistamentos;
- adiciona comentários a alguns registros;
- associa avistamentos a usuários;
- usa bcrypt para as senhas.

O seed foi criado para demonstração ao vivo e não deve ser tratado como dados oficiais de produção.

---

# 20. Troubleshooting

## `JWT_SECRET não configurado`

Verifique:

```env
JWT_SECRET=...
```

no `.env`.

## Erro de conexão com PostgreSQL

Verifique:

- PostgreSQL em execução;
- banco existente;
- usuário;
- senha;
- porta;
- `DATABASE_URL`.

## Prisma Client desatualizado

Execute:

```bash
npx prisma generate
```

## Banco sem tabelas

Execute:

```bash
npx prisma migrate deploy
```

## Frontend recebe erro de CORS

Verifique a origem do frontend e compare com a lista configurada no `src/server.js`.

---

# 21. Boas práticas para manutenção

- não versionar `.env`;
- não colocar `JWT_SECRET` no código;
- não aceitar `userId` do cliente para determinar o autor de um registro;
- manter autorização baseada em `req.user.id`;
- criar migrations para alterações estruturais;
- evitar apagar migrations já aplicadas;
- atualizar este README quando novas rotas forem adicionadas;
- adicionar validações de domínio antes de considerar uma entrada confiável.

---

# 22. Próximas melhorias técnicas sugeridas

Estas não são funcionalidades atuais; são sugestões de evolução.

- validar faixa de confiança no backend;
- validar latitude e longitude;
- validar datas;
- adicionar testes automatizados para controllers e rotas;
- adicionar documentação OpenAPI/Swagger;
- implementar paginação de `/av`;
- adicionar filtros diretamente na API;
- centralizar tratamento de erros;
- adicionar rate limiting às rotas de autenticação;
- considerar estratégia de sessão mais resistente a XSS do que armazenamento de JWT em `localStorage`;
- criar endpoint específico para estatísticas, caso o volume de dados cresça.

---

# 23. Responsáveis

| Membro | Atuação |
|---|---|
| **Antonio Vedana** | Rotas, BD, BackEnd e FrontEnd |
| **Lucas Vargas** | Rotas, BD e BackEnd |
| **Arthur Wolf** | React e FrontEnd |
| **Miguel Wolf** | Arquitetura e Documentação |
