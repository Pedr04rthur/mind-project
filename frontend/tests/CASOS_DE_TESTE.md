# Documentação de Testes — MindCare Frontend

## 1. Identificação do projeto

- Projeto: MindCare
- Instituição: Instituto Federal da Paraíba (IFPB)
- Curso: Tecnologia em Sistemas para Internet
- Disciplina: Desenvolvimento de Software
- Componente: Frontend
- Tecnologia: React e TypeScript
- Data de execução: 24/11/2026

## 2. Objetivo

Este documento apresenta os casos de teste desenvolvidos
para o frontend do sistema MindCare.

O objetivo dos testes é verificar o funcionamento das
principais regras de negócio, dos contextos React,
das funções auxiliares, da autenticação, da proteção
de rotas e da interface de login.

Busca-se identificar possíveis falhas, garantir a
consistência dos dados e reduzir o risco de regressões
durante a manutenção e evolução do sistema.

## 3. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Vitest 5.1.1 | Framework de execução dos testes |
| React Testing Library | Testes de componentes e contextos React |
| jsdom | Simulação do ambiente do navegador |
| Jest DOM | Validação dos elementos da interface |
| V8 Coverage | Análise de cobertura de código |
| TypeScript | Tipagem estática |
| vi.mock | Simulação de dependências externas |

## 4. Metodologia

Os testes foram desenvolvidos utilizando a abordagem
de testes unitários e testes de componentes com
dependências simuladas.

Foi utilizado o padrão AAA (Arrange, Act, Assert):

- Arrange: preparação dos dados e dependências.
- Act: execução da funcionalidade testada.
- Assert: verificação do resultado esperado.

As chamadas ao backend foram simuladas por meio de
mocks, permitindo testar o comportamento do frontend
de maneira isolada e independente do servidor.

Cada teste possui um cenário específico e resultados
esperados previamente definidos.

O ambiente de teste realiza a limpeza dos componentes,
mocks, localStorage e sessionStorage após cada execução,
reduzindo interferências entre os casos de teste.

## 5. Estrutura dos testes

    tests/
    ├── components/
    │   └── RouteGuards.test.tsx
    ├── contexts/
    │   ├── AuthContext.test.tsx
    │   ├── ConsultasContext.test.tsx
    │   ├── PacientesContext.test.tsx
    │   └── ProfissionaisContext.test.tsx
    ├── pages/
    │   └── Login.test.tsx
    ├── utils/
    │   ├── adapters.test.ts
    │   ├── auth.test.ts
    │   ├── dates.test.ts
    │   └── prescricao.test.ts
    ├── setup.ts
    └── CASOS_DE_TESTE.md

## 6. Casos de teste

### 6.1. Conversão de perfis e usuários

Arquivo: tests/utils/auth.test.ts

Objetivo: validar a conversão dos dados de autenticação
retornados pela API para o formato utilizado no frontend.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-001 | Converter perfil PATIENT | Retornar PACIENTE | Aprovado |
| CT-002 | Converter perfil PROFESSIONAL | Retornar PROFISSIONAL | Aprovado |
| CT-003 | Converter perfil RECEPTIONIST | Retornar RECEPCAO | Aprovado |
| CT-004 | Converter dados do paciente | Mapear corretamente os atributos | Aprovado |
| CT-005 | Converter dados do profissional | Preservar perfil e especialidade | Aprovado |
| CT-006 | Converter dados da recepção | Preservar perfil e email | Aprovado |
| CT-007 | Converter campos opcionais nulos | Tratar valores ausentes corretamente | Aprovado |

Total: 7 testes.

### 6.2. Prescrições e orientações terapêuticas

Arquivo: tests/utils/prescricao.test.ts

Objetivo: verificar a classificação, os estados e a
inicialização dos dados das prescrições.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-008 | Classificar aconselhamento | Reconhecer como orientação | Aprovado |
| CT-009 | Classificar exercício | Reconhecer como orientação | Aprovado |
| CT-010 | Classificar orientação legada | Reconhecer como orientação | Aprovado |
| CT-011 | Classificar medicamento | Não reconhecer como orientação | Aprovado |
| CT-012 | Classificar exame | Não reconhecer como orientação | Aprovado |
| CT-013 | Traduzir estado DRAFT | Retornar Rascunho | Aprovado |
| CT-014 | Traduzir estado ISSUED | Retornar Emitida | Aprovado |
| CT-015 | Traduzir estado CANCELLED | Retornar Cancelada | Aprovado |
| CT-016 | Traduzir tipo MEDICATION | Retornar Medicamento | Aprovado |
| CT-017 | Traduzir tipo EXAM | Retornar Exame | Aprovado |
| CT-018 | Traduzir tipo COUNSELING | Retornar Aconselhamento | Aprovado |
| CT-019 | Traduzir tipo EXERCISE | Retornar Exercício | Aprovado |
| CT-020 | Inicializar item de medicamento | Criar campos vazios | Aprovado |
| CT-021 | Criar múltiplos itens | Gerar objetos independentes | Aprovado |

Total: 14 testes.

### 6.3. Contexto de consultas

Arquivo: tests/contexts/ConsultasContext.test.tsx

Objetivo: validar o gerenciamento das consultas e a
comunicação do contexto com os serviços simulados.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-022 | Inicializar contexto | Lista vazia e ausência de erros | Aprovado |
| CT-023 | Agendar consulta | Enviar CPF normalizado | Aprovado |
| CT-024 | Cancelar consulta | Enviar identificador correto | Aprovado |
| CT-025 | Reagendar consulta | Enviar nova data e horário | Aprovado |
| CT-026 | Carregar consultas por data | Retornar consultas correspondentes | Aprovado |
| CT-027 | Consultar agenda vazia | Retornar lista vazia | Aprovado |
| CT-028 | Falha ao carregar agenda | Apresentar mensagem de erro | Aprovado |
| CT-029 | Consultar período | Consultar todos os dias solicitados | Aprovado |
| CT-030 | Ordenar consultas | Apresentar ordem cronológica | Aprovado |
| CT-031 | Consultar período superior a 60 dias | Bloquear solicitação | Aprovado |
| CT-032 | Falha no agendamento | Propagar erro e atualizar contexto | Aprovado |

Total: 11 testes.

### 6.4. Contexto de profissionais

Arquivo: tests/contexts/ProfissionaisContext.test.tsx

Objetivo: verificar o carregamento dos profissionais,
o controle por perfil e o tratamento de erros.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-033 | Carregar profissionais pela recepção | Retornar profissionais da API simulada | Aprovado |
| CT-034 | Receber dados dos profissionais | Preservar atributos retornados | Aprovado |
| CT-035 | Acessar contexto como paciente | Não carregar lista administrativa | Aprovado |
| CT-036 | Acessar contexto como profissional | Não carregar lista administrativa | Aprovado |
| CT-037 | Acessar sem autenticação | Não consultar API | Aprovado |
| CT-038 | Receber lista vazia | Apresentar lista vazia sem erro | Aprovado |
| CT-039 | Falha de comunicação | Registrar mensagem de erro | Aprovado |
| CT-040 | Receber resposta inválida | Identificar formato inválido | Aprovado |
| CT-041 | Atualizar lista de profissionais | Recarregar dados | Aprovado |

Total: 9 testes.

### 6.5. Adaptadores de dados

Arquivo: tests/utils/adapters.test.ts

Objetivo: verificar a transformação dos dados entre
os formatos utilizados pelo frontend e pelo backend.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-042 | Normalizar CPF formatado | Remover pontuação | Aprovado |
| CT-043 | Normalizar CPF numérico | Preservar os dígitos | Aprovado |
| CT-044 | Formatar CPF recebido | Aplicar máscara de CPF | Aprovado |
| CT-045 | Receber CPF com menos dígitos | Completar com zeros à esquerda | Aprovado |
| CT-046 | Converter paciente da API | Mapear atributos para o frontend | Aprovado |
| CT-047 | Converter paciente para API | Mapear atributos para requisição | Aprovado |
| CT-048 | Converter humor bom | Retornar GOOD | Aprovado |
| CT-049 | Converter humor ruim | Retornar BAD | Aprovado |

Total: 8 testes.

### 6.6. Manipulação de datas

Arquivo: tests/utils/dates.test.ts

Objetivo: validar a formatação de datas e horários.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-050 | Formatar data local | Retornar AAAA-MM-DD | Aprovado |
| CT-051 | Formatar dia e mês menores que 10 | Preencher com zeros | Aprovado |
| CT-052 | Formatar horário | Retornar HH:MM | Aprovado |
| CT-053 | Converter data para backend | Retornar DD-MM-AAAA | Aprovado |

Total: 4 testes.

### 6.7. Contexto de autenticação

Arquivo: tests/contexts/AuthContext.test.tsx

Objetivo: verificar o gerenciamento da sessão,
autenticação e encerramento de acesso.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-054 | Inicializar sem sessão | Usuário não autenticado | Aprovado |
| CT-055 | Autenticar paciente | Armazenar token e dados do usuário | Aprovado |
| CT-056 | Persistir sessão | Armazenar usuário no sessionStorage | Aprovado |
| CT-057 | Recuperar sessão existente | Restaurar usuário | Aprovado |
| CT-058 | Recuperar sessão inválida | Ignorar JSON inválido | Aprovado |
| CT-059 | Informar credenciais inválidas | Rejeitar autenticação | Aprovado |
| CT-060 | Realizar logout | Limpar token e sessão | Aprovado |
| CT-061 | Falha durante logout | Limpar sessão local | Aprovado |
| CT-062 | Receber acesso não autorizado | Encerrar sessão | Aprovado |
| CT-063 | Consultar rota inicial por perfil | Retornar rota correspondente | Aprovado |

Total: 10 testes.

### 6.8. Contexto de pacientes

Arquivo: tests/contexts/PacientesContext.test.tsx

Objetivo: validar as operações de gerenciamento de
pacientes e a listagem conforme o perfil autenticado.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-064 | Carregar pacientes pela recepção | Retornar lista de pacientes | Aprovado |
| CT-065 | Buscar paciente pelo CPF | Localizar paciente correspondente | Aprovado |
| CT-066 | Cadastrar paciente | Enviar dados e atualizar lista | Aprovado |
| CT-067 | Atualizar paciente | Enviar dados modificados | Aprovado |
| CT-068 | Excluir paciente | Solicitar exclusão e atualizar lista | Aprovado |
| CT-069 | Acessar contexto como paciente | Não carregar lista administrativa | Aprovado |
| CT-070 | Acessar sem autenticação | Não consultar API | Aprovado |
| CT-071 | Listar pacientes do profissional | Retornar pacientes vinculados | Aprovado |
| CT-072 | Receber consultas canceladas e duplicadas | Filtrar registros indevidos | Aprovado |
| CT-073 | Falha de comunicação | Registrar mensagem de erro | Aprovado |

Total: 10 testes.

### 6.9. Interface de login

Arquivo: tests/pages/Login.test.tsx

Objetivo: validar as interações do usuário com a
tela de autenticação.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-074 | Renderizar tela de login | Exibir campos e botão de entrada | Aprovado |
| CT-075 | Entrar sem selecionar perfil | Exibir mensagem de validação | Aprovado |
| CT-076 | Entrar sem credenciais | Exibir mensagem de validação | Aprovado |
| CT-077 | Mostrar e ocultar senha | Alternar visibilidade da senha | Aprovado |
| CT-078 | Autenticar paciente | Redirecionar para diário | Aprovado |
| CT-079 | Autenticar profissional | Redirecionar para painel profissional | Aprovado |
| CT-080 | Autenticar recepção | Redirecionar para painel da recepção | Aprovado |
| CT-081 | Selecionar perfil incorreto | Exibir mensagem de divergência | Aprovado |
| CT-082 | Informar credenciais inválidas | Exibir mensagem de erro | Aprovado |

Total: 9 testes.

### 6.10. Proteção de rotas

Arquivo: tests/components/RouteGuards.test.tsx

Objetivo: verificar o controle de navegação do
frontend conforme autenticação e perfil do usuário.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| CT-083 | Acessar rota sem autenticação | Redirecionar para login | Aprovado |
| CT-084 | Acessar rota com perfil autorizado | Exibir conteúdo protegido | Aprovado |
| CT-085 | Paciente acessar rota não permitida | Redirecionar para diário | Aprovado |
| CT-086 | Profissional acessar rota não permitida | Redirecionar para painel profissional | Aprovado |
| CT-087 | Recepção acessar rota não permitida | Redirecionar para painel da recepção | Aprovado |

Total: 5 testes.

## 7. Resultado consolidado

| Módulo | Testes | Aprovados | Reprovados |
|---|---:|---:|---:|
| Conversão de perfis | 7 | 7 | 0 |
| Prescrições | 14 | 14 | 0 |
| Contexto de consultas | 11 | 11 | 0 |
| Contexto de profissionais | 9 | 9 | 0 |
| Adaptadores | 8 | 8 | 0 |
| Datas | 4 | 4 | 0 |
| Contexto de autenticação | 10 | 10 | 0 |
| Contexto de pacientes | 10 | 10 | 0 |
| Login | 9 | 9 | 0 |
| Proteção de rotas | 5 | 5 | 0 |
| TOTAL | 87 | 87 | 0 |

### 7.1. Indicadores de execução

- Arquivos de teste executados: 10
- Total de testes executados: 87
- Total de testes aprovados: 87
- Total de testes reprovados: 0
- Taxa de aprovação: 100%
- Tempo de execução com cobertura: 8,34 segundos

### 7.2. Evidência de execução

    Test Files  10 passed (10)
         Tests  87 passed (87)
      Duration  8.34s

## 8. Cobertura de código

A cobertura foi obtida utilizando o mecanismo V8,
integrado ao Vitest.

### 8.1. Cobertura global

| Métrica | Inicial | Final |
|---|---:|---:|
| Statements | 4,28% | 11,23% |
| Branches | 1,40% | 4,21% |
| Functions | 2,91% | 7,97% |
| Lines | 4,68% | 11,94% |

A cobertura global considera os arquivos de código
incluídos na configuração do relatório, incluindo
módulos que ainda não possuem testes automatizados.

### 8.2. Cobertura de linhas por módulo testado

| Arquivo | Cobertura |
|---|---:|
| RouteGuards.tsx | 100% |
| adapters.ts | 100% |
| auth.ts | 100% |
| prescricao.ts | 100% |
| dates.ts | 100% |
| ConsultasContext.tsx | 96,36% |
| PacientesContext.tsx | 95,65% |
| Login.tsx | 95,45% |
| AuthContext.tsx | 94,73% |
| ProfissionaisContext.tsx | 77,19% |

## 9. Instruções para execução

Os comandos devem ser executados na pasta frontend.

### 9.1. Instalar dependências

    npm ci

### 9.2. Executar testes em modo interativo

    npm test

### 9.3. Executar todos os testes uma única vez

    npm run test:run

### 9.4. Gerar relatório de cobertura

    npm run coverage

### 9.5. Visualizar relatório HTML no Ubuntu

    xdg-open coverage/index.html

O relatório HTML é gerado automaticamente na pasta
coverage após a execução do comando de cobertura.

## 10. Limitações

Os testes apresentados concentram-se nas funções
auxiliares, nos contextos React, na autenticação,
na interface de login e na proteção de rotas.

As dependências externas foram simuladas, portanto
os resultados não comprovam isoladamente a integração
com o backend real ou a persistência no banco de dados.

A proteção de rotas testada refere-se à navegação no
frontend e não substitui a autorização no backend.

As interfaces de auditoria LGPD, diário de humor,
alertas clínicos, prescrições e orientações terapêuticas
não possuem testes diretos nesta suíte.

Os serviços HTTP também não foram diretamente testados,
pois suas chamadas foram simuladas nos testes dos
contextos.

A taxa de aprovação de 100% corresponde exclusivamente
aos 87 casos executados e não representa cobertura
integral do sistema ou comprovação de conformidade
com a LGPD.

## 11. Conclusão

A implementação dos testes automatizados contribuiu
para a validação das principais funcionalidades
selecionadas do frontend do MindCare.

Foram executados 87 casos de teste distribuídos em
10 arquivos, obtendo-se uma taxa de aprovação de 100%,
sem falhas durante a execução.

Os módulos diretamente testados apresentaram cobertura
de linhas entre 77,19% e 100%, demonstrando uma boa
abrangência dos cenários selecionados.

A cobertura global de linhas alcançou 11,94%, indicando
que ainda existem oportunidades de ampliação dos testes
para outros componentes e funcionalidades do sistema.

A suíte desenvolvida estabelece uma base para a
manutenção do projeto, permitindo verificar regressões
e apoiar futuras evoluções do software.
