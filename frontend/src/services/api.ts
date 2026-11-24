import type {
  FiltrosAuditoria,
  PaginaAuditoria,
} from "../types/auditoria";

import type { MeApiResponse } from "../types/auth";
import type {
  Prescricao,
  PrescricaoRequest,
} from "../types/prescricao";

const BASE = "/api";

// ---------- Token em memória ----------

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

// ---------- Erro ----------

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  skipRefresh?: boolean;
}

// ---------- Fetch core ----------

async function rawRequest(
  path: string,
  init?: RequestOptions
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
}

async function parseError(res: Response): Promise<ApiError> {
  let message = `Erro ${res.status}`;
  let code: string | undefined;

  try {
    const body = await res.json();

    if (body?.message) message = body.message;
    if (body?.code) code = body.code;

    if (!body?.message) {
      if (res.status === 400)
        message = "Dados inválidos.";
      else if (res.status === 401)
        message = "Sessão expirada. Faça login novamente.";
      else if (res.status === 403)
        message = "Sem permissão para esta ação.";
      else if (res.status === 404)
        message = "Recurso não encontrado.";
      else if (res.status === 409)
        message = "Conflito: recurso já existe.";
      else if (res.status >= 500)
        message = "Erro no servidor.";
    }
  } catch {
    if (res.status === 401)
      message = "Sessão expirada. Faça login novamente.";
    else if (res.status >= 500)
      message = "Erro no servidor.";
  }

  return new ApiError(message, res.status, code);
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { token: string };

    accessToken = data.token;

    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  init?: RequestOptions
): Promise<T> {
  let res = await rawRequest(path, init);

  if (res.status === 401 && !init?.skipRefresh) {
    const ok = await tryRefresh();

    if (ok) {
      res = await rawRequest(path, init);
    } else {
      accessToken = null;
      onUnauthorized?.();
    }
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;

  const text = await res.text();

  return text
    ? (JSON.parse(text) as T)
    : (undefined as T);
}

// ---------- Tipos ----------

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
  moodLevel: MoodLevelApi;
  comment: string | null;
}

export interface ProfessionalApi {
  id: number;
  name: string;
  specialty: string;
}

export interface AppointmentApiRequest {
  patientCpf: string;
  professionalId: number;
  scheduledAt: string;
}

export interface AppointmentDetailsApi {
  id: number;
  scheduledAt: string;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";

  patient: {
    id: number;
    cpf: string;
    name: string;
  };

  professional: {
    id: number;
    name: string;
    specialty: string;
  };
}

export interface ScheduleItemApi {
  consultationId: number;
  scheduledAt: string;
  patientId: number;
  patientName: string;
  professionalId: number;
  professionalName: string;
}

export interface AuthResponseApi {
  token: string;
  profile: "PATIENT" | "RECEPTIONIST" | "PROFESSIONAL";
}

// ---------- Endpoints ----------

export interface ConsultationByProfessionalApi {
  professionalId: number;
  professionalName: string;
  specialty: string;
  totalConsultations: number;
}

export const api = {
  reports: {
    consultationsByProfessional: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const query = params.toString();

      return request<ConsultationByProfessionalApi[]>(
        `/reports/consultations-by-professional${query ? `?${query}` : ""}`
      );
    },
  },

  // ---------- Autenticação ----------

  auth: {
    signin: (email: string, password: string) =>
      request<AuthResponseApi>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipRefresh: true,
      }),

    logout: () =>
      request<void>("/auth/logout", {
        method: "POST",
        skipRefresh: true,
      }),

    refresh: () =>
      request<AuthResponseApi>("/auth/refresh", {
        method: "POST",
        skipRefresh: true,
      }),

    me: () =>
      request<MeApiResponse>("/auth/me"),
  },

  // ---------- Pacientes ----------

  patients: {
    list: (page = 0, size = 100) =>
      request<PageResponse<PatientApi>>(
        `/patients?page=${page}&size=${size}`
      ),

    getByCpf: (cpf: string) =>
      request<PatientApi>(`/patients/${cpf}`),

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
      request<void>(`/patients/${cpf}`, {
        method: "DELETE",
      }),
  },

  // ---------- Registros de humor ----------

  mood: {
    register: (cpf: string, data: MoodApiRequest) =>
      request<void>(`/patients/${cpf}/moods`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: (cpf: string, direction: "ASC" | "DESC" = "DESC") =>
      request<
        {
          id: number;
          level: MoodLevelApi;
          date: string;
          comment: string | null;
        }[]
      >(`/patients/${cpf}/moods?direction=${direction}`),

    update: (cpf: string, id: number, data: MoodApiRequest) =>
      request<void>(`/patients/${cpf}/moods/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // ---------- Profissionais ----------

  professionals: {
    list: () =>
      request<ProfessionalApi[]>("/professionals"),

    getById: (id: number) =>
      request<ProfessionalApi>(`/professionals/${id}`),
  },

  // ---------- Consultas ----------

  appointments: {
    listMine: () =>
      request<AppointmentDetailsApi[]>("/appointments"),

    create: (data: AppointmentApiRequest) =>
      request<void>("/appointments", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getById: (id: number) =>
      request<AppointmentDetailsApi>(`/appointments/${id}`),

    cancel: (id: number) =>
      request<void>(`/appointments/${id}/cancel`, {
        method: "PATCH",
      }),

    reschedule: (id: number, scheduledAt: string) =>
      request<void>(`/appointments/${id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt }),
      }),
  },

  // ---------- Prescrições ----------

  prescriptions: {
    list: (consultationId: number) =>
      request<Prescricao[]>(
        `/appointments/${consultationId}/prescriptions`
      ),

    getById: (
      consultationId: number,
      prescriptionId: number
    ) =>
      request<Prescricao>(
        `/appointments/${consultationId}/prescriptions/${prescriptionId}`
      ),

    create: (
      consultationId: number,
      data: PrescricaoRequest
    ) =>
      request<Prescricao>(
        `/appointments/${consultationId}/prescriptions`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),

    update: (
      consultationId: number,
      prescriptionId: number,
      data: PrescricaoRequest
    ) =>
      request<Prescricao>(
        `/appointments/${consultationId}/prescriptions/${prescriptionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),

    issue: (
      consultationId: number,
      prescriptionId: number
    ) =>
      request<void>(
        `/appointments/${consultationId}/prescriptions/${prescriptionId}/issue`,
        {
          method: "POST",
        }
      ),

    cancel: (
      consultationId: number,
      prescriptionId: number
    ) =>
      request<void>(
        `/appointments/${consultationId}/prescriptions/${prescriptionId}`,
        {
          method: "DELETE",
        }
      ),
  },

  // ---------- Agenda ----------

  schedule: {
    byDate: (date: string) =>
      request<ScheduleItemApi[]>(`/schedule?date=${date}`),
  },
};

export const auditoriaApi = {
  listar(filtros: FiltrosAuditoria = {}) {
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== "") {
        params.set(chave, String(valor));
      }
    });

    return request<PaginaAuditoria>(
      `/audit?${params.toString()}`
    );
  },
};
