# 🥋 Prime Victory

> Plataforma completa para gestão de tatames, academias e esportes com agendamento automatizado, comunicação em tempo real e controle de equipes.

**✨ Gratuito e Open Source** | Desenvolvido para democratizar a gestão esportiva

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Arquitetura do Sistema](#️-arquitetura-do-sistema)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)

## 🎯 Visão Geral

O **Prime Victory** é uma aplicação moderna para auxiliar na gestão de tatames e esportes, oferecendo uma solução completa para academias, clubes e grupos esportivos.

### Principais Capacidades

- 📊 **Gestão de Equipes** — cadastro e organização de equipes com divisões hierárquicas e diferentes níveis de permissão
- 👥 **Gerenciamento de Membros** — controle de alunos, professores e administradores com perfis personalizados
- 📅 **Agendamento Inteligente** — criação automática de aulas e eventos com base em calendários predefinidos
- 📈 **Controle de Presença** — registro e cálculo automático da quantidade de aulas participadas por cada aluno
- 🏫 **Turmas Organizadas** — criação de turmas dentro de grupos com gerenciamento de horários e instrutores
- 💬 **Comunicação Integrada** — chat em grupo ou pessoa a pessoa para facilitar a comunicação
- 🔔 **Notificações Push** — avisos automáticos enviados diretamente para o celular dos usuários
- 🔐 **Autenticação Segura** — login com JWT, OAuth2 (Google, Facebook) e controle de sessões

## ✨ Funcionalidades 

### Agendamento e Automação
- 🔄 **Agendamento dinâmico de aulas** — usuários escolhem dias e horários; o backend cria jobs no BullMQ que executam automaticamente no horário configurado
- ⏰ **Criação automática de eventos** — sistema gera aulas recorrentes baseado em padrões definidos pelos administradores
- 📊 **Relatórios automatizados** — geração de relatórios de presença e participação processados em segundo plano

### Comunicação em Tempo Real
- ⚡ **Notificações instantâneas** — alunos e professores recebem notificações em tempo real via WebSocket
- � **Chat integrado** — conversas individuais e em grupo com histórico persistente
- 🔔 **Avisos push** — notificações enviadas para dispositivos móveis dos usuários

### Performance e Confiabilidade
- 🕒 **Tarefas assíncronas com BullMQ** — processamento em segundo plano sem travar a aplicação principal
- 💾 **Persistência de jobs** — se o servidor reiniciar, os jobs permanecem salvos e são reativados automaticamente
- 🚀 **Alta performance** — utilização de Fastify para máxima velocidade de resposta

## 🛠 Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Banco de Dados:** MongoDB com Mongoose ODM
- **Autenticação:** Passport.js, JWT, OAuth2 (Google, Facebook)
- **HTTP Server:** Fastify (alta performance)
- **Real-time:** WebSocket
- **Filas:** BullMQ + Redis
- **Agendamento:** node-cron
- **Logging:** Pino
- **Documentação API:** Swagger/OpenAPI
- **Validação:** class-validator, class-transformer

### Frontend
- **Framework:** React Native
- **State Management:** Zustand
- **Styling:** NativeWind (TailwindCSS)

### Infraestrutura & DevOps
- **Proxy Reverso:** Nginx (load balancing, SSL/TLS, cache)
- **Containerização:** Docker + Docker Compose
- **Orquestração:** Kubernetes
- **CI/CD:** Jenkins
- **Monitoramento:** Pino Logger

## ⚙️ Arquitetura do Sistema

O backend é responsável por toda a lógica de negócios, automações e comunicações em tempo real, seguindo uma arquitetura modular e escalável.

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (React Native)                    │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS/WSS
┌────────────────▼────────────────────────────────────────────┐
│                    Nginx (Proxy Reverso)                     │
│         • Load Balancing  • SSL/TLS  • Cache                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────────┐
│                      NestJS API Gateway                      │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐  │
│  │  Auth    │  Users   │  Teams   │ Classes  │ Messaging │  │
│  │  Module  │  Module  │  Module  │  Module  │  Module   │  │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘  │
└────────────────┬───────────────────────────────┬────────────┘
                 │                               │
        ┌────────▼──────────┐         ┌─────────▼──────────┐
        │   MongoDB/Mongoose │         │  Redis + BullMQ    │
        │  (Dados Principais)│         │ (Filas e Cache)    │
        └────────────────────┘         └────────────────────┘
```

### Módulos da Aplicação

- **Auth Module:** Autenticação JWT, OAuth2, gerenciamento de tokens e refresh tokens
- **User Module:** CRUD de usuários, perfis, reset de senha
- **Teams Module:** Gestão de equipes, membros e hierarquias (papéis: admin, instructor, member)
- **Classes Module:** Gerenciamento de aulas, agendamentos automáticos, controle de presença e turmas
- **Logger Module:** Sistema de logs estruturado com Pino
- **Common Module:** Serviços compartilhados (hash, validações)

### Fluxo de Dados

1. **Requisição do Cliente** → Nginx (Proxy Reverso)
2. **Roteamento** → API Gateway (NestJS + Fastify)
3. **Autenticação** → Passport Strategies (JWT, OAuth2)
4. **Validação** → DTOs com class-validator
5. **Processamento** → Services + Mongoose ODM
6. **Persistência** → MongoDB
7. **Resposta** → JSON + Logs (Pino)

### 💡 BullMQ e WebSocket em Conjunto

O sistema utiliza o **BullMQ** para agendar e processar tarefas assíncronas:
- ✅ Criação automática de aulas em horários definidos pelos usuários
- ✅ Envio de notificações e e-mails em lote
- ✅ Geração de relatórios de presença e participação
- ✅ Processamento de arquivos e mídia

Quando o BullMQ finaliza uma tarefa, o **WebSocket Gateway** envia uma notificação em tempo real aos clientes conectados, garantindo sincronia imediata entre o backend e a interface do usuário.

### Recursos de Confiabilidade

- 🔄 **Retry automático:** Jobs com falha são reprocessados automaticamente
- 💾 **Persistência:** Redis garante que nenhum job seja perdido, mesmo com reinicializações
- 📊 **Monitoramento:** Logs estruturados com Pino para rastreamento completo
- 🔐 **Segurança:** Guards JWT em todas as rotas protegidas

## 📁 Estrutura do Projeto

```
prime-victory/
├── src/
│   ├── auth/                    # Autenticação e autorização
│   │   ├── guards/              # JWT Guards
│   │   ├── strategy/            # Passport Strategies
│   │   ├── dto/                 # DTOs de autenticação
│   │   └── entities/            # Entidades (Refresh Token)
│   │
│   ├── user/                    # Gerenciamento de usuários
│   │   ├── dto/                 # DTOs (update, password reset)
│   │   └── entities/            # User Entity
│   │
│   ├── teams/                   # Gestão de equipes
│   │   ├── dto/                 # DTOs de equipes
│   │   └── entities/            # Team, TeamMembers Entities
│   │
│   ├── classes/                 # Gerenciamento de aulas
│   │   ├── classes.controller.ts
│   │   ├── classes.service.ts
│   │   ├── classes.module.ts
│   │   ├── dto/                 # DTOs de aulas
│   │   │   ├── create-class.dto.ts
│   │   │   ├── update-class.dto.ts
│   │   │   └── attendance.dto.ts
│   │   ├── entities/            # Entidades de aulas
│   │   │   ├── class.entity.ts
│   │   │   ├── schedule.entity.ts
│   │   │   └── attendance.entity.ts
│   │   └── jobs/                # Jobs de agendamento
│   │       └── class-scheduler.processor.ts
│   │
│   ├── common/                  # Serviços compartilhados
│   │   └── services/            # Hash Service, etc
│   │
│   ├── logger/                  # Sistema de logs
│   │   └── custom.logger.ts     # Pino Logger customizado
│   │
│   ├── config/                  # Configurações da aplicação
│   │
│   ├── types/                   # Tipos TypeScript globais
│   │   └── team-role.ts         # Roles: admin, instructor, member
│   │
│   └── main.ts                  # Entry point da aplicação
│
├── nginx/                       # Configuração Nginx
│   ├── nginx.conf               # Configuração principal
│   └── ssl/                     # Certificados SSL/TLS
│
├── docker-compose.yml           # Configuração Docker
├── nest-cli.json                # Configuração NestJS CLI
├── tsconfig.json                # Configuração TypeScript
└── package.json                 # Dependências e scripts
```

## 🚀 Instalação

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **MongoDB** >= 6.x
- **Redis** >= 7.x (para BullMQ)
- **Nginx** >= 1.24.x (para proxy reverso)
- **Docker** e **Docker Compose** (opcional, mas recomendado)

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/Mhlpereira/prime.git
cd prime-victory

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Instalação com Docker

```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

## ⚙️ Configuração

### MongoDB

Certifique-se de ter uma instância MongoDB rodando. Com Docker:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

### Redis

Para o BullMQ funcionar, é necessário Redis:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine
```


## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo watch
npm run start:debug        # Inicia em modo debug

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia versão compilada

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com cobertura
npm run test:e2e           # Testes end-to-end

# Code Quality
npm run lint               # Executa ESLint
npm run format             # Formata código com Prettier
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/prime-victory
MONGO_USERNAME=admin
MONGO_PASSWORD=password

# JWT
JWT_SECRET=seu-secret-super-seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro
JWT_REFRESH_EXPIRES_IN=7d

# OAuth2 - Google
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth2 - Facebook
FACEBOOK_APP_ID=seu-facebook-app-id
FACEBOOK_APP_SECRET=seu-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server
PORT=3000
NODE_ENV=development

# WebSocket
WS_PORT=3001
```

## 👨‍💼 Autor

<div align="center">

Desenvolvido por **Mario Henrique Lino Pereira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mario-henrique-/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mariohenriquelp@gmail.com)

📧 **Email:** [mariohenriquelp@gmail.com](mailto:mariohenriquelp@gmail.com)  
💼 **LinkedIn:** [linkedin.com/in/mario-henrique-](https://www.linkedin.com/in/mario-henrique-/)

</div>

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade de esportes de combate**

[Reportar Bug](https://github.com/Mhlpereira/prime/issues) · [Solicitar Feature](https://github.com/Mhlpereira/prime/issues) · [Contribuir](CONTRIBUTING.md)

</div>