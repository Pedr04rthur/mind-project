# Casos de teste do backend

## Estratégia e execução

Os testes de serviço, controller, validação e handler são testes unitários com JUnit 5. Mockito simula os repositórios e serviços que ficam fora da unidade testada. Os testes de controller chamam os métodos diretamente; não sobem um servidor HTTP e não validam o roteamento real do Spring.

`MindprojectApplicationTests.contextLoads` é o teste de contexto preexistente: inicializa a aplicação e confirma que o contexto Spring sobe. A suíte atual tem 52 testes: 51 unitários e esse teste de contexto.

Executar com:

```bash
mvn clean test
```

## `PatientServiceTest` — 11 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `createSavesPatientWhenCpfAndEmailAreAvailable` | CPF e e-mail ainda não existem; cadastrar paciente. | O repositório salva um `Patient`. |
| `createRejectsExistingCpf` | CPF já cadastrado. | Lança `BadRequestException`; não verifica e-mail nem salva. |
| `createRejectsExistingEmail` | CPF está disponível, mas o e-mail já existe. | Lança `BadRequestException`; não salva. |
| `updateChangesPatientData` | Paciente existe e novos CPF/e-mail estão disponíveis. | Atualiza CPF, nome, telefone, e-mail, endereço e senha; retorna a mesma entidade salva. |
| `updateRejectsCpfAlreadyUsedByAnotherPatient` | CPF atualizado já pertence a outra pessoa. | Lança `BadRequestException`; não verifica duplicidade do e-mail nem salva. |
| `updateRejectsEmailAlreadyUsedByAnotherPatient` | CPF permanece igual e o novo e-mail já existe. | Lança `BadRequestException`; não salva. |
| `deleteRemovesExistingPatient` | Paciente existe. | Chama `delete` do repositório com a entidade localizada. |
| `deleteRejectsMissingPatient` | CPF não encontrado. | Lança `NotFoundException`; não chama `delete`. |
| `findAllReturnsRepositoryPage` | Repositório retorna uma página para o `Pageable` pedido. | O serviço retorna a mesma página. |
| `findByCpfReturnsPatient` | CPF existe. | Retorna a entidade correspondente. |
| `findByCpfRejectsMissingPatient` | CPF não existe. | Lança `NotFoundException`. |

## `MoodServiceTest` — 4 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `saveCreatesMoodForToday` | Paciente ainda não tem registro hoje. | Salva humor com paciente, nível, comentário e data atual. |
| `saveRejectsSecondMoodOnSameDay` | Repositório indica registro para o CPF na data atual. | Lança `BadRequestException`; não salva outro humor. |
| `findByPatientCpfUsesAscendingDateAndIdSort` | Consulta de histórico crescente. | Retorna a lista do repositório e pede ordenação ascendente por `date` e `id`. |
| `findByPatientCpfUsesDescendingDateAndIdSort` | Consulta de histórico decrescente. | Retorna a lista do repositório e pede ordenação descendente por `date` e `id`. |

## `ConsultationServiceTest` — 15 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `createSavesScheduledConsultationWhenSlotIsAvailable` | Paciente e profissional existem e o horário está livre. | Salva e retorna consulta `SCHEDULED` com entidades e horário recebidos. |
| `createRejectsMissingPatient` | CPF do paciente não é encontrado. | Lança `NotFoundException`; não busca profissional nem salva. |
| `createRejectsMissingProfessional` | Paciente existe, profissional não. | Lança `NotFoundException`; não salva. |
| `createRejectsProfessionalWithOccupiedSlot` | Profissional já tem consulta `SCHEDULED` no instante solicitado. | Lança `ConflictException`; não salva. |
| `cancelChangesScheduledConsultationStatus` | Consulta existe e está `SCHEDULED`. | O status passa a `CANCELLED`. |
| `cancelRejectsConsultationThatIsNotScheduled` | Consulta já está cancelada. | Lança `ConflictException`. |
| `cancelRejectsMissingConsultation` | Identificador não existe. | Lança `NotFoundException`. |
| `rescheduleUpdatesDateWhenNewSlotIsAvailable` | Consulta agendada e novo horário do profissional está livre. | Atualiza `scheduledAt`. |
| `rescheduleDoesNotCheckSlotWhenDateIsUnchanged` | Novo horário é igual ao atual. | Retorna sem consultar conflito do profissional. |
| `rescheduleRejectsOccupiedSlot` | Novo horário já está ocupado por consulta agendada. | Lança `ConflictException` e mantém data original. |
| `rescheduleRejectsConsultationThatIsNotScheduled` | Consulta está cancelada. | Lança `ConflictException` sem consultar conflito de horário. |
| `rescheduleRejectsMissingConsultation` | Identificador não existe. | Lança `NotFoundException`. |
| `findScheduledByDateQueriesStartAndEndOfDateInAscendingOrder` | Busca agenda de um dia. | Retorna resultados do repositório para intervalo início do dia até início do dia seguinte, status `SCHEDULED` e ordem por horário ascendente. |
| `findDetailsReturnsConsultation` | Consulta existe com paciente e profissional. | Retorna a entidade detalhada. |
| `findDetailsRejectsMissingConsultation` | Consulta não existe. | Lança `NotFoundException`. |

## Testes dos controllers — 12 casos

### `PatientControllerTest` — 5 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `createReturnsCreatedAndPassesRequestFieldsToService` | Envia dados de paciente válidos ao método do controller. | Retorna `201 CREATED` e repassa todos os campos ao serviço. |
| `findAllReturnsMappedPatients` | Serviço retorna página com paciente. | Retorna `200 OK` e converte o conteúdo para `PatientResponse`. |
| `findByCpfReturnsMappedPatient` | Serviço localiza CPF. | Retorna `200 OK` com CPF no DTO de resposta. |
| `updatePassesRequestAndReturnsMappedPatient` | Envia atualização para CPF atual. | Retorna `200 OK`, encaminha os campos ao serviço e mapeia o paciente atualizado. |
| `deleteReturnsNoContent` | Solicita exclusão por CPF. | Retorna `204 NO_CONTENT` e chama o serviço com o CPF recebido. |

### `MoodControllerTest` — 2 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `logMoodAssociatesMoodWithPatientFromPath` | Registra humor com CPF no caminho. | Busca esse paciente, envia humor/comentário/entidade ao serviço e retorna `200 OK`. |
| `findByPatientCpfReturnsMoodResponsesInRequestedDirection` | Consulta histórico em `ASC`. | Confirma existência do paciente, pede histórico crescente e retorna DTOs em `200 OK`. |

### `ConsultationControllerTest` — 4 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `createReturnsOkAndPassesRequestToService` | Envia paciente, profissional e data/hora. | Retorna `200 OK` e encaminha os três valores ao serviço. |
| `findByIdReturnsConsultationDetails` | Serviço encontra consulta com paciente e profissional. | Retorna `200 OK` com nomes do paciente e profissional no DTO. |
| `cancelReturnsNoContentAndPassesIdToService` | Cancela pelo identificador. | Retorna `204 NO_CONTENT` e chama cancelamento do serviço. |
| `rescheduleReturnsNoContentAndPassesRequestedDateToService` | Envia novo horário. | Retorna `204 NO_CONTENT` e encaminha identificador e horário ao serviço. |

### `ScheduleControllerTest` — 1 caso

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `findByDateReturnsScheduledConsultationsWithPatientAndProfessionalDetails` | Consulta a agenda de um dia com um compromisso. | Retorna `200 OK`, com nome do paciente e do profissional, após chamar o serviço para a data pedida. |

## `RequestValidationTest` — 5 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `patientRequestRejectsInvalidRequiredFields` | CPF inválido, campos vazios, e-mail malformado e senha curta. | Bean Validation encontra violações. |
| `patientRequestAcceptsValidFields` | CPF, nome, telefone, e-mail, endereço e senha válidos. | Bean Validation não encontra violações. |
| `moodLogRequestRequiresMoodAndLimitsCommentLength` | Nível ausente e comentário acima de 500 caracteres. | Ambos os objetos apresentam violações. |
| `consultationRequestRequiresPatientProfessionalAndDate` | CPF vazio, profissional e data/hora ausentes. | Bean Validation encontra violações. |
| `rescheduleRequestRequiresDate` | Primeiro data/hora ausente; depois data/hora fornecida. | A primeira entrada é inválida e a segunda é válida. |

## `GlobalExceptionHandlerTest` — 4 casos

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `handleBadRequestReturnsBadRequestDetails` | Handler recebe `BadRequestException`. | Retorna `400`, código `BAD_REQUEST` e mensagem original. |
| `handleConflictReturnsConflictDetails` | Handler recebe `ConflictException`. | Retorna `409`, código `CONFLICT` e mensagem original. |
| `handleNotFoundReturnsNotFoundDetails` | Handler recebe `NotFoundException`. | Retorna `404`, código `NOT_FOUND` e mensagem original. |
| `handleUnexpectedReturnsGenericInternalServerError` | Handler recebe exceção não específica contendo mensagem interna. | Retorna `500`, código genérico e mensagem segura `Ocorreu um erro inesperado`, sem expor detalhe interno. |

## `MindprojectApplicationTests` — 1 caso de contexto

| Caso | Cenário e intenção | Resultado esperado |
| --- | --- | --- |
| `contextLoads` | Inicializa a aplicação Spring com as configurações de teste e H2. | Contexto sobe sem falhas. |

## Cobertura que não está incluída

- Os testes de controller são chamadas unitárias aos métodos, não testes HTTP com `MockMvc`; portanto não verificam dispatch de rotas, conversão de parâmetros, serialização JSON nem integração real do `@Valid` com o handler genérico.
- Não há endpoints ou serviços de triagem, CRUD de profissional, conclusão de consulta, alertas ou autenticação para testar.
- Os métodos derivados e a consulta nativa dos repositórios não são validados por testes de integração JPA nesta suíte; as regras de serviço são verificadas com repositórios simulados.
