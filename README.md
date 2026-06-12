# EducAI

## Sobre o Sistema

O **EducAI** é uma plataforma educacional inteligente desenvolvida para modernizar o processo de ensino e aprendizagem por meio de **quizzes interativos**, **gamificação**, **gestão acadêmica** e **integração com Inteligência Artificial (LLM)**.

O sistema foi projetado para atender instituições de ensino, docentes e estudantes, oferecendo recursos que tornam a criação de conteúdo, avaliações e acompanhamento de desempenho mais eficientes e dinâmicos.

---

## Objetivo do Projeto

O principal objetivo do **EducAI** é unir tecnologia e educação em uma única plataforma, proporcionando:

- Criação e aplicação de quizzes interativos;
- Avaliações com foco em engajamento e gamificação;
- Monitoramento de desempenho de alunos e turmas;
- Automação de tarefas pedagógicas com IA;
- Apoio aos docentes na criação de aulas e questionários;
- Ambiente moderno, responsivo e intuitivo.

---

## Níveis de Acesso

### Administrador

Responsável pelo gerenciamento geral da plataforma.

**Permissões:**

- Criar, editar e inativar usuários;
- Definir permissões e níveis de acesso;
- Monitorar logs e auditorias;
- Configurar parâmetros globais do sistema.

---

### Corpo Docente

Usuários responsáveis pela gestão pedagógica e aplicação de conteúdo.

**Permissões:**

- Criar, editar e excluir quizzes;
- Gerenciar banco de questões;
- Aplicar avaliações;
- Acompanhar desempenho das turmas;
- Gerar relatórios;
- Utilizar o chat com IA para criação de aulas e questionários.

---

### Estudante

Usuário final da plataforma.

**Permissões:**

- Participar de quizzes via código PIN;
- Responder avaliações;
- Visualizar ranking e desempenho;
- Consultar histórico individual;
- Editar apenas dados do próprio perfil.

---

## Integração com Inteligência Artificial (LLM)

Um dos principais diferenciais do **EducAI** é a integração com uma **LLM (Large Language Model)**, utilizada para auxiliar docentes na produção de conteúdo pedagógico.

### Funcionalidades da IA

#### Geração de Aulas

O professor informa tema, série e objetivo, e a IA pode gerar:

- Plano de aula completo;
- Introdução ao conteúdo;
- Desenvolvimento do tema;
- Atividades práticas;
- Sugestões de encerramento.

#### Geração de Questionários

Com base em um tema informado, a IA pode criar:

- Questões objetivas;
- Questões dissertativas;
- Perguntas por nível de dificuldade;
- Avaliações completas.

#### Apoio Pedagógico Inteligente

A IA também poderá sugerir:

- Conteúdos de reforço;
- Questões baseadas em dificuldades da turma;
- Ideias de atividades complementares;
- Trilhas personalizadas de aprendizagem.

---

## Benefícios do Sistema

- Redução de tempo na preparação de aulas;
- Maior engajamento dos alunos;
- Ensino mais dinâmico e interativo;
- Apoio tecnológico ao docente;
- Decisões pedagógicas baseadas em dados;
- Escalabilidade para instituições de ensino.

---

## Como rodar o projeto

O EducAI é uma aplicação **Laravel + Inertia + React**, com banco **PostgreSQL** e frontend servido pelo **Vite**.

Você pode rodar de duas formas:

- Localmente, usando PHP/Composer/Node instalados na máquina;
- Pelo Docker, usando o `docker-compose.yml` do projeto.

---

## Rodando localmente com Laravel + Inertia

### Requisitos

- PHP 8.3 ou superior;
- Composer;
- Node.js 20 ou superior;
- PostgreSQL local;
- Extensões PHP usadas pelo Laravel, como `pdo_pgsql`, `mbstring`, `xml`, `curl`, `zip`, `intl`, `gd` e `bcmath`.

### 1. Instale as dependências

```bash
composer install
npm install
```

### 2. Configure o arquivo `.env`

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Gere a chave da aplicação:

```bash
php artisan key:generate
```

Para rodar localmente fora do Docker, configure o banco apontando para o PostgreSQL da sua máquina:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=educai
DB_USERNAME=educai
DB_PASSWORD=educai
```

Crie o banco `educai` no PostgreSQL, se ele ainda não existir.

### 3. Rode as migrations

```bash
php artisan migrate --seed
```

### 4. Inicie o ambiente de desenvolvimento

```bash
composer run dev
```

Esse comando sobe, em paralelo:

- Servidor Laravel em `http://127.0.0.1:8000`;
- Vite para os assets do React/Inertia;
- Worker de fila;
- Logs com Laravel Pail.

Depois acesse:

```text
http://127.0.0.1:8000
```

---

## Rodando com Docker

### Requisitos

- Docker;
- Docker Compose.

### 1. Configure o `.env`

Crie o arquivo:

```bash
cp .env.example .env
```

No Docker, o host do banco deve ser o nome do serviço PostgreSQL no Compose:

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=educai
DB_USERNAME=educai
DB_PASSWORD=educai
```

### 2. Suba os containers

```bash
docker compose up --build
```

O container da aplicação executa o `entrypoint.sh`, que prepara o ambiente, aguarda o PostgreSQL, roda migrations e inicia Laravel + Vite.

Depois acesse:

```text
http://localhost:8000
```

### Comandos úteis no Docker

Executar migrations manualmente:

```bash
docker compose exec app php artisan migrate --seed
```

Limpar cache de configuração:

```bash
docker compose exec app php artisan config:clear
```

Instalar dependências JS dentro do container:

```bash
docker compose exec app npm install
```

Testar acesso do container ao GitHub, útil quando o Composer falhar por timeout:

```bash
docker compose run --rm app curl -I https://api.github.com
```

Parar os containers:

```bash
docker compose down
```

Parar e remover volumes, incluindo banco, `vendor` e `node_modules`:

```bash
docker compose down -v
```

Use `down -v` apenas se puder recriar os dados do banco.

---

## Configurando IA/LLM

O provedor de IA é configurado pelo `.env`.

Exemplo usando Gemini:

```env
LLM_PROVIDER=gemini
LLM_TIMEOUT=60
LLM_MAX_QUESTIONS=20
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
```

Também existem variáveis para outros provedores:

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Nunca commit sua chave real de API. Use apenas o `.env` local ou variáveis de ambiente do Docker/servidor.

Depois de alterar variáveis de ambiente, limpe o cache:

```bash
php artisan config:clear
```

Ou, no Docker:

```bash
docker compose exec app php artisan config:clear
```

---

## Observações comuns

- Fora do Docker, use `DB_HOST=127.0.0.1`.
- Dentro do Docker, use `DB_HOST=postgres`.
- Se o Vite reclamar de dependência ausente, rode `npm install` localmente ou dentro do container.
- Se o Composer falhar baixando pacotes do GitHub, verifique a rede do Docker com `docker compose run --rm app curl -I https://api.github.com`.
