const BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();

      // 1. Mensagem explícita do backend
      if (body?.message) {
        message = body.message;
      }
      // 2. Erro padrão do Spring sem mensagem
      else if (body?.error) {
        if (res.status === 400) {
          message = "Dados inválidos. Verifique os campos e tente novamente.";
        } else {
          message = body.error;
        }
      }
      // 3. Fallbacks por status
      else if (res.status === 400) {
        message = "Dados inválidos.";
      } else if (res.status === 404) {
        message = "Recurso não encontrado.";
      } else if (res.status === 409) {
        message = "Registro já existe.";
      } else if (res.status >= 500) {
        message = "Erro no servidor. Tente novamente em alguns instantes.";
      }
    } catch {
      if (res.status >= 500) {
        message = "Erro no servidor. Tente novamente em alguns instantes.";
      }
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PatientApi {
  id: number;
  cpf: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PatientApiRequest {
  cpf: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

export type MoodLevelApi = "GOOD" | "BAD";

export interface MoodApiRequest {
  patientCpf: string;
  moodLevel: MoodLevelApi;
  comment: string | null;
}

export const api = {
  patients: {
    list: (page = 0, size = 100) =>
      request<PageResponse<PatientApi>>(
        `/patients?page=${page}&size=${size}`
      ),
    getByCpf: (cpf: string) => request<PatientApi>(`/patients/${cpf}`),
    create: (data: PatientApiRequest) =>
      request<void>("/patients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (cpf: string, data: PatientApiRequest) =>
      request<PatientApi>(`/patients/${cpf}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (cpf: string) =>
      request<void>(`/patients/${cpf}`, { method: "DELETE" }),
  },
  mood: {
    register: (data: MoodApiRequest) =>
      request<void>("/mood", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
