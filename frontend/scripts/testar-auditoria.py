import urllib.request
import urllib.error
import json
import random
import datetime
import os

BASE = os.environ.get(
    "MINDCARE_API",
    "http://localhost/api"
).rstrip("/")

def request(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}

    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(data).encode() if data is not None else None,
        headers=headers,
        method=method
    )

    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode()
            return response.status, json.loads(body) if body else None

    except urllib.error.HTTPError as error:
        body = error.read().decode()

        try:
            body = json.loads(body)
        except Exception:
            pass

        return error.code, body

def login(email, senha):
    status, body = request(
        "POST",
        "/auth/signin",
        {"email": email, "password": senha}
    )

    if status != 200:
        raise RuntimeError(f"Falha no login: HTTP {status}")

    return body["token"]

def gerar_cpf():
    numeros = [random.randint(0, 9) for _ in range(9)]

    for peso in (10, 11):
        soma = sum(
            numero * (peso - i)
            for i, numero in enumerate(numeros)
        )

        digito = (soma * 10) % 11
        numeros.append(0 if digito == 10 else digito)

    return "".join(map(str, numeros))

recepcao = login(
    "recepcao@mindcare.com",
    "senha123"
)

paciente = login(
    "ana.souza@exemplo.com",
    "senha123"
)

exclusoes = 0
capturadas = 0
falhas = 0

print("\n=== TESTE DE AUDITORIA LGPD ===\n")

for i in range(5):

    cpf = gerar_cpf()

    dados = {
        "cpf": cpf,
        "name": f"Paciente Auditoria {i + 1}",
        "phone": "83999999999",
        "email": f"auditoria{cpf}@exemplo.com",
        "address": "Endereco ficticio de teste",
        "password": "senha123"
    }

    status, body = request(
        "POST",
        "/patients",
        dados,
        recepcao
    )

    if status not in (200, 201):
        print(f"[FALHA] Cadastro: HTTP {status}", body)
        falhas += 1
        continue

    status, body = request(
        "DELETE",
        f"/patients/{cpf}",
        token=recepcao
    )

    if status != 204:
        print(f"[FALHA] Exclusao: HTTP {status}", body)
        falhas += 1
        continue

    exclusoes += 1

    status, body = request(
        "GET",
        f"/audit?cpf={cpf}&tabela=patients",
        token=recepcao
    )

    logs = body.get("content", []) if status == 200 else []

    encontrados = [
        log for log in logs
        if log.get("cpfAfetado") == cpf
        and log.get("tabelaAfetada") == "patients"
        and log.get("responsavel") == "recepcao@mindcare.com"
    ]

    if len(encontrados) == 1:
        capturadas += 1
        print(f"[OK] Exclusao {i + 1} registrada.")
    else:
        falhas += 1
        print(f"[FALHA] Log ausente ou duplicado: {cpf}")

    status, _ = request(
        "GET",
        f"/patients/{cpf}",
        token=recepcao
    )

    if status != 404:
        falhas += 1
        print("[FALHA] Paciente ainda existe ou consulta falhou.")

    status, _ = request(
        "DELETE",
        f"/patients/{cpf}",
        token=recepcao
    )

    status_log, body = request(
        "GET",
        f"/audit?cpf={cpf}",
        token=recepcao
    )

    if status == 404 and status_log == 200 and body["totalElements"] == 1:
        print("[OK] Exclusao inexistente nao gerou outro log.")
    else:
        falhas += 1
        print("[FALHA] Controle de exclusao inexistente.")

    hoje = datetime.date.today().isoformat()

    status, body = request(
        "GET",
        f"/audit?cpf={cpf}&inicio={hoje}&fim={hoje}",
        token=recepcao
    )

    if status == 200 and body["totalElements"] == 1:
        print("[OK] Filtro por CPF e periodo.")
    else:
        falhas += 1
        print("[FALHA] Filtro por periodo.")

status, _ = request(
    "GET",
    "/audit",
    token=paciente
)

if status == 403:
    print("\n[OK] Paciente bloqueado na auditoria.")
else:
    falhas += 1
    print(f"\n[FALHA] Acesso do paciente: HTTP {status}")

status, _ = request("GET", "/audit")

if status == 401:
    print("[OK] Acesso sem autenticacao bloqueado.")
else:
    falhas += 1
    print(f"[FALHA] Acesso anonimo: HTTP {status}")

percentual = (
    capturadas / exclusoes * 100
    if exclusoes else 0
)

print("\n==============================")
print(f"Exclusoes realizadas: {exclusoes}")
print(f"Exclusoes capturadas: {capturadas}")
print(f"Cobertura observada: {percentual:.2f}%")
print(f"Falhas: {falhas}")
print("==============================")

if exclusoes == 5 and percentual == 100 and falhas == 0:
    print("APROVADO: cenario de exclusao de pacientes.")
else:
    print("REPROVADO: verificar os erros.")
    raise SystemExit(1)
