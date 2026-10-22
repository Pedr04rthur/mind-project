const BASE = "/api";

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    let code: string | undefined;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      if (body?.code) code = body.code;
      if (!body?.message) {
        if (res.status === 400) message = "Dados inválidos.";
        else if (res.status === 404) message = "Recurso não encontrado.";
        else if (res.status === 409) message = "Conflito: recurso já existe.";
        else if (res.status >= 500) message = "Erro no servidor.";
      }
    } catch {
      if (res.status >= 500) message = "Erro no servidor.";
    }
    throw new ApiError(message, res.status, code);
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
  patient: { id: number; cpf: string; name: string };
  professional: { id: number; name: string; specialty: string };
}

export interface ScheduleItemApi {
  consultationId: number;
  scheduledAt: string;
  patientId: number;
  patientName: string;
  professionalId: number;
  professionalName: string;
}

export const api = {
  patients: {
    list: (page = 0, size = 100) => request<PageResponse<PatientApi>>(`/patients?page=${page}&size=${size}`),
    getByCpf: (cpf: string) => request<PatientApi>(`/patients/${cpf}`),
    create: (data: PatientApiRequest) => request<void>("/patients", { method: "POST", body: JSON.stringify(data) }),
    update: (cpf: string, data: PatientApiRequest) => request<PatientApi>(`/patients/${cpf}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (cpf: string) => request<void>(`/patients/${cpf}`, { method: "DELETE" }),
  },
  mood: {
    register: (cpf: string, data: MoodApiRequest) =>
      request<void>(`/patients/${cpf}/moods`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (cpf: string, direction: "ASC" | "DESC" = "DESC") =>
      request<{ id: number; level: MoodLevelApi; date: string; comment: string | null }[]>(`/patients/${cpf}/moods?direction=${direction}`),
    update: (cpf: string, id: number, data: MoodApiRequest) =>
      request<void>(`/patients/${cpf}/moods/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  professionals: {
    list: () => request<ProfessionalApi[]>("/professionals"),
    getById: (id: number) => request<ProfessionalApi>(`/professionals/${id}`),
  },
  appointments: {
    create: (data: AppointmentApiRequest) => request<void>("/appointments", { method: "POST", body: JSON.stringify(data) }),
    getById: (id: number) => request<AppointmentDetailsApi>(`/appointments/${id}`),
    cancel: (id: number) => request<void>(`/appointments/${id}/cancel`, { method: "PATCH" }),
    reschedule: (id: number, scheduledAt: string) => request<void>(`/appointments/${id}/reschedule`, { method: "PATCH", body: JSON.stringify({ scheduledAt }) }),
  },
  schedule: {
    byDate: (date: string) => request<ScheduleItemApi[]>(`/schedule?date=${date}`),
  },
};
