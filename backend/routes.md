# Rotas da API

Este documento descreve as rotas declaradas nos controllers atuais. Não há prefixo global de API configurado no código; os caminhos abaixo são relativos à raiz da aplicação.

## Formato de erro

As exceções de aplicação retornam um corpo com este formato:

```json
{
  "status": 409,
  "code": "CONFLICT",
  "message": "Professional already has a consultation scheduled at this time",
  "timestamp": "2026-10-21T12:30:00"
}
```

`timestamp` é um `LocalDateTime`, sem informação de fuso horário. Os códigos definidos são:

| HTTP | Código | Quando ocorre |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Regra de negócio rejeita os dados, por exemplo CPF ou e-mail já cadastrado, ou humor já registrado no dia. |
| 404 | `NOT_FOUND` | Paciente, profissional ou consulta solicitado não existe. |
| 409 | `CONFLICT` | A operação conflita com o estado da consulta ou com o horário ocupado do profissional. |
| 500 | `INTERNAL_SERVER_ERROR` | Qualquer exceção sem handler mais específico. A mensagem é `Ocorreu um erro inesperado`. |

O handler genérico também captura erros de validação de DTO (`@Valid`), JSON malformado e falhas de conversão de parâmetros. Atualmente, esses casos podem retornar `500`; não há handler específico de validação.

## Pacientes

### `POST /patients`

Cria um paciente.

**Corpo obrigatório (`PatientRequest`):**

| Campo | Tipo | Regras |
| --- | --- | --- |
| `cpf` | string | Obrigatório, CPF válido e único. |
| `name` | string | Obrigatório; máximo de 100 caracteres. |
| `phone` | string | Obrigatório. |
| `email` | string | Obrigatório, formato de e-mail e único. |
| `address` | string | Obrigatório. |
| `password` | string | Obrigatório; mínimo de 6 caracteres. |

**Sucesso:** `201 CREATED`, sem corpo.

**Erros de negócio:** `400 BAD_REQUEST` se CPF ou e-mail já estiver cadastrado. Erros de validação do corpo atualmente caem no handler genérico e podem retornar `500 INTERNAL_SERVER_ERROR`.

**Regra:** a unicidade de CPF e e-mail é verificada pelo serviço e também declarada na entidade persistida.

### `GET /patients`

Lista pacientes paginados.

**Parâmetros de query opcionais do Spring Data:**

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `page` | inteiro | Página, começando em zero. |
| `size` | inteiro | Quantidade de itens por página. |
| `sort` | string repetível | Propriedade e direção, por exemplo `name,asc`. |

**Sucesso:** `200 OK`, corpo `Page<PatientResponse>`. Cada paciente contém `id`, `cpf`, `name`, `phone`, `email` e `address`; senha não é incluída.

**Erros de negócio:** nenhum definido nesta rota. Erros inesperados retornam `500 INTERNAL_SERVER_ERROR`.

### `GET /patients/{cpf}`

Busca paciente pelo CPF.

**Parâmetros de caminho:**

| Parâmetro | Tipo | Obrigatório |
| --- | --- | --- |
| `cpf` | string | Sim |

**Sucesso:** `200 OK`, corpo `PatientResponse` (`id`, `cpf`, `name`, `phone`, `email`, `address`).

**Erros:** `404 NOT_FOUND` se o CPF não corresponder a paciente cadastrado; `500 INTERNAL_SERVER_ERROR` para exceções sem handler específico.

### `PUT /patients/{cpf}`

Atualiza todos os dados do paciente identificado pelo CPF atual.

**Parâmetro de caminho:** `cpf` (string), CPF atual do paciente.

**Corpo obrigatório:** mesmo `PatientRequest` de `POST /patients`; os dados incluem o novo CPF.

**Sucesso:** `200 OK`, corpo `PatientResponse` atualizado.

**Erros:** `404 NOT_FOUND` se o CPF atual não existir; `400 BAD_REQUEST` se o novo CPF ou e-mail pertencer a outro paciente; erros de validação do corpo podem retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico.

**Regra:** se CPF ou e-mail não mudar, o serviço não consulta duplicidade para aquele campo. Se mudar, rejeita valor já utilizado.

### `DELETE /patients/{cpf}`

Exclui o paciente identificado pelo CPF.

**Parâmetro de caminho:** `cpf` (string).

**Sucesso:** `204 NO_CONTENT`, sem corpo.

**Erros:** `404 NOT_FOUND` se o paciente não existir; `500 INTERNAL_SERVER_ERROR` para exceções sem handler específico. Restrições de relacionamento do banco podem impedir exclusão se o paciente tiver registros associados.

## Humor

### `POST /patients/{cpf}/moods`

Registra o humor do dia para o paciente indicado.

**Parâmetro de caminho:** `cpf` (string), CPF do paciente.

**Corpo obrigatório (`MoodLogRequest`):**

| Campo | Tipo | Regras |
| --- | --- | --- |
| `moodLevel` | enum | Obrigatório; `BAD` ou `GOOD`. |
| `comment` | string ou null | Opcional; máximo de 500 caracteres. |

**Sucesso:** `200 OK`, sem corpo.

**Erros:** `404 NOT_FOUND` se o paciente não existir; `400 BAD_REQUEST` se já houver humor para o paciente na data atual; erros de validação do corpo podem retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico.

**Regra:** a data é atribuída pelo servidor usando `LocalDate.now()`. O serviço permite um registro por paciente por data.

### `GET /patients/{cpf}/moods`

Lista o histórico de humor do paciente.

**Parâmetro de caminho:** `cpf` (string), CPF do paciente.

**Parâmetros de query:**

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `direction` | `ASC` ou `DESC` | `DESC` | Ordena por data e, como desempate, pelo identificador na mesma direção. |

**Sucesso:** `200 OK`, lista de `MoodResponse`, cada item com `id`, `level`, `date` e `comment`.

**Erros:** `404 NOT_FOUND` se o paciente não existir; valor de `direction` inválido pode cair no handler genérico e retornar `500 INTERNAL_SERVER_ERROR`.

## Consultas

### `POST /appointments`

Agenda consulta para um paciente e profissional.

**Corpo obrigatório (`ConsultationRequest`):**

| Campo | Tipo | Regras |
| --- | --- | --- |
| `patientCpf` | string | Obrigatório; deve identificar paciente existente. Não há validação `@CPF` neste DTO. |
| `professionalId` | número inteiro longo | Obrigatório; deve identificar profissional existente. |
| `scheduledAt` | data e hora ISO local | Obrigatório; não há regra que exija data futura. |

**Sucesso:** `200 OK`, sem corpo.

**Erros:** `404 NOT_FOUND` se paciente ou profissional não existir; `409 CONFLICT` se o profissional já tiver consulta `SCHEDULED` no mesmo instante; erros de validação do corpo podem retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico.

**Regra:** uma nova consulta começa com status `SCHEDULED`. A verificação de conflito compara o instante exato e considera apenas consultas com esse status.

### `GET /appointments/{id}`

Busca detalhes da consulta.

**Parâmetro de caminho:** `id` (inteiro longo), identificador da consulta.

**Sucesso:** `200 OK`, corpo `ConsultationDetailsResponse`:

- `id`, `scheduledAt` e `status`;
- `patient`: `id`, `cpf` e `name`;
- `professional`: `id`, `name` e `specialty`.

**Erros:** `404 NOT_FOUND` se a consulta não existir; valor de `id` não numérico pode retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico.

### `PATCH /appointments/{id}/cancel`

Cancela a consulta.

**Parâmetro de caminho:** `id` (inteiro longo).

**Sucesso:** `204 NO_CONTENT`, sem corpo.

**Erros:** `404 NOT_FOUND` se a consulta não existir; `409 CONFLICT` se o status não for `SCHEDULED`.

**Regra:** consulta agendada muda para `CANCELLED`. Consultas canceladas ou concluídas não podem ser canceladas novamente.

### `PATCH /appointments/{id}/reschedule`

Altera data e hora da consulta.

**Parâmetro de caminho:** `id` (inteiro longo).

**Corpo obrigatório (`RescheduleConsultationRequest`):**

| Campo | Tipo | Regras |
| --- | --- | --- |
| `scheduledAt` | data e hora ISO local | Obrigatório; não há regra que exija data futura. |

**Sucesso:** `204 NO_CONTENT`, sem corpo.

**Erros:** `404 NOT_FOUND` se a consulta não existir; `409 CONFLICT` se não estiver `SCHEDULED` ou se outro compromisso `SCHEDULED` ocupar o novo horário do mesmo profissional; erros de validação do corpo podem retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico.

**Regra:** se a nova data e hora for idêntica à atual, a operação termina sem consultar conflito. Caso contrário, verifica o horário e atualiza a consulta.

## Agenda

### `GET /schedule`

Lista consultas agendadas de um dia.

**Parâmetro de query obrigatório:**

| Parâmetro | Tipo | Formato |
| --- | --- | --- |
| `date` | data | `DD-MM-YYYY`, por exemplo `21-10-2026`. |

**Sucesso:** `200 OK`, lista ordenada por horário crescente. Cada `ScheduleItemResponse` contém `consultationId`, `scheduledAt`, `patientId`, `patientName`, `professionalId` e `professionalName`.

**Erros:** ausência ou formato inválido do parâmetro pode retornar `500 INTERNAL_SERVER_ERROR` pelo handler genérico. Erros inesperados também retornam `500`.

**Regra:** inclui apenas consultas com status `SCHEDULED` cujo horário esteja dentro do dia informado.

## Regras ainda não expostas por rotas

- Existe uma entidade `Triage` com paciente, queixa, sintomas, histórico de atendimento em saúde mental, medicações, prioridade, observações, responsável da recepção e data de criação. Não há controller, serviço ou repositório para criar ou consultar triagens.
- Existem entidade e repositório de `Professional`, mas não há rotas para criar, listar, atualizar ou excluir profissionais.
- O status `COMPLETED` existe, mas não há rota ou serviço para concluir consulta.
- Não há rotas de alertas, autenticação ou autorização.
