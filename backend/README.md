# Prime Victory Backend

## Tech Stack

- **Framework**: NestJS v11
- **Plataforma HTTP**: Fastify v11
- **ORM**: Prisma v6
- **Banco**: PostgreSQL
- **Autenticação**: JWT + Passport (Local, JWT, Google, Facebook)
- **Logging**: Pino + NestJS-Pino
- **Documentação**: Swagger/OpenAPI
- **Validação**: Class Validator + Class Transformer
- **Hashing**: bcrypt
- **Linguagem**: TypeScript

## Estrutura do Projeto

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── constants/
│   ├── dto/
│   ├── guards/
│   └── strategy/
├── gym/
│   ├── gym.controller.ts
│   ├── gym.module.ts
│   └── gym.service.ts
├── user/
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── logger/
│   ├── custom.logger.ts
│   └── logger.module.ts
├── common/
├── config/
├── db/
└── classes/
```

## Scripts Disponíveis

- `npm run start` - Inicia em produção
- `npm run start:dev` - Inicia em desenvolvimento com watch
- `npm run build` - Compila TypeScript
- `npm run test` - Executa testes
- `npm run lint` - Executa ESLint

## Migrations

### Gerar Migration Inicial
```bash
npx prisma migrate dev --name init
```

### Gerar Nova Migration
1. Edite o `prisma/schema.prisma`
2. Execute:
```bash
npx prisma migrate dev --name nome_da_mudanca
```

### Aplicar Migrations em Produção
```bash
npx prisma migrate deploy
```

### Regenerar Prisma Client
```bash
npx prisma generate
```
