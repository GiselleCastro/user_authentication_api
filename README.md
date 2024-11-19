[Em construção]

# API de Autenticação do Usuário

Esta API fornece endpoints para autenticação de usuários, registro, e gerenciamento de contas, incluindo recuperação de senha, confirmação de e-mail e manipulação de tokens.

## Tecnologias utilizadas

#### Backend e Framework

- **Fastify**
- **Knex**
- **SQLite3**
- **Winston**

#### Autenticação e Segurança

- **bcrypt**
- **jsonwebtoken**

#### Validação e Tipagem

- **Zod**

#### Outras Dependências

- **ejs**
- **googleapis**

#### Ferramentas de Desenvolvimento

- **TypeScript**
- **Babel**
- **ESLint**
- **Prettier**
- **Jest**

## Como iniciar

### Pré-requisitos

- Node.js (versão >= 21.5)
- npm (versão >= 10.2.4)
- Docker (versão >= 27.3.1)

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/GiselleCastro/user_authentication_api.git

   cd user_authentication_api
   ```

- Sem o Docker

  2.1 Instale as dependências

  ```bash
  npm install
  ```

  2.2 Crie um arquivo .env a partir do .env.example e preencha o valor das variáveis

  ```bash
  cp .env.example .env
  ```

  2.3. Inicie o servidor

  ```bash
  npm start
  ```

  2.4 No modo de desenvolvimento

  ```bash
  npm run dev
  ```

- Com o Docker

  2.1 Crie um arquivo .env a partir do .env.example e preencha o valor das variáveis

  ```bash
  cp .env.example .env
  ```

  2.2 Basta executar no terminal

  ```bash
  npm run docker:start
  ```

  2.3 No modo de desenvolvimento

  ```bash
  npm run docker:dev
  ```

## Documentação com Swagger

A API inclui uma interface interativa gerada pelo **Swagger**, permitindo explorar e testar os endpoints de forma fácil.

### Como acessar

Após iniciar o servidor, você pode acessar a documentação no navegador: [http://localhost:${PORT}/api-docs](), conforme a porta configurada no arquivo `.env`.
