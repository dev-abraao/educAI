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

## Funcionalidades

- Gestão de usuários com três níveis de acesso: administrador, professor e aluno
- Criação de turmas com código de convite para entrada dos alunos
- Quizzes com múltiplas questões, alternativas, pontuação por questão e tempo limite
- Correção automática e exibição de gabarito após o envio
- Geração de questões por IA a partir de tema e nível de dificuldade
- Dashboard de desempenho por turma e histórico individual do aluno

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13 · PHP 8.3 |
| Frontend | Inertia.js · React 18 · TypeScript |
| Banco de dados | PostgreSQL 16 |
| Build | Vite 6 |
| Testes | Pest PHP |
| Infra | Docker Compose |

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

## Executando com Docker

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
git clone <url-do-repositorio>
cd educAI
cp .env.example .env
```

Adicione sua chave no `.env`:

```
OPENAI_API_KEY=sk-proj-...
```

```bash
docker compose up --build
```

Acesse em `http://localhost:8000`.

---