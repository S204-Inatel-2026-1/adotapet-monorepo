// src/services/api.ts

import { Pet } from '@/types/pets';
import { AuthUser, UserRole } from '@/contexts/AuthContext';

const API_BASE_URL = '/api-backend';

// Decodifica o payload do JWT sem biblioteca
export function decodeJwtPayload(token: string): any {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Normaliza o retorno bruto do backend para o tipo AuthUser
export function normalizeUser(raw: any): AuthUser {
  const rawRole = (raw?.role ?? raw?.tipo ?? 'adopter').toLowerCase();
  const role: UserRole = rawRole === 'ong' ? 'ong' : 'adopter';

  return {
    name:   raw?.fullName ?? raw?.name ?? raw?.nome ?? raw?.username ?? 'Usuário',
    email:  raw?.email ?? '',
    role,
    avatar: raw?.avatar ?? raw?.photo ?? undefined,
  };
}

export function normalizePet(raw: any): Pet {
  // Converte ageInMonths para texto legível
  const ageMonths = raw.ageInMonths ?? 0;
  const ageLabel = ageMonths < 12
    ? `${ageMonths} ${ageMonths === 1 ? 'mês' : 'meses'}`
    : `${Math.floor(ageMonths / 12)} ${Math.floor(ageMonths / 12) === 1 ? 'ano' : 'anos'}`;

  // Mapeia species do backend (DOG/CAT) para o tipo do frontend (dog/cat)
  const speciesMap: Record<string, 'dog' | 'cat'> = {
    DOG: 'dog', CAT: 'cat', dog: 'dog', cat: 'cat',
  };

  // Mapeia size do backend (SMALL/MEDIUM/LARGE) para o frontend
  const sizeMap: Record<string, 'small' | 'medium' | 'large'> = {
    SMALL: 'small', MEDIUM: 'medium', LARGE: 'large',
    small: 'small', medium: 'medium', large: 'large',
  };

  // Mapeia gender
  const genderMap: Record<string, 'male' | 'female'> = {
    MALE: 'male', FEMALE: 'female', male: 'male', female: 'female',
  };

  // Monta location como "Cidade – Estado"
  const location = raw.city && raw.state
    ? `${raw.city} – ${raw.state}`
    : raw.city ?? raw.state ?? '';

  return {
    id:          raw.id,
    name:        raw.name ?? '',
    image:       raw.photoUrl ?? raw.image ?? '/pets/default.jpg',
    type:        speciesMap[raw.species ?? raw.type] ?? 'dog',
    breed:       raw.breed ?? '',
    gender:      genderMap[raw.sex ?? raw.gender] ?? 'male',
    age:         ageLabel,
    size:        sizeMap[raw.size] ?? 'medium',
    location,
    description: raw.description ?? '',
    tags: raw.tags
      ? raw.tags.split(',').map((t: string) => t.trim())
      : undefined,
  };
}

async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adotapet_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // ← fix do bug 304
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// Nosso serviço de API real (Adeus Mocks! 👋)
export const api = {
  getPets: async (): Promise<Pet[]> => {
    const data = await fetchClient('/pets');
    // Backend pode retornar array direto ou { data: [...] }
    const list = Array.isArray(data) ? data : data.data ?? data.pets ?? [];
    return list.map(normalizePet);
  },

  getPetById: async (id: number | string): Promise<Pet> => {
    const data = await fetchClient(`/pets/${id}`);
    return normalizePet(data);
  },

  getUserById: async (id: string | number) => {
    return fetchClient(`/users/${id}`);
  },

  // Atualizar dados do usuário
  updateUser: async (id: string, userData: any) => {
    return fetchClient(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        city: userData.city,
        state: userData.state,
      }),
    });
  },

  login: async (credentials: any) => {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any) => {
    return fetchClient('/users', {
      method: 'POST',
      body: JSON.stringify({
        fullName: userData.name,
        email:    userData.email,
        password: userData.password,
        phone:    userData.phone,
        role:     'ADOPTER',
      }),
    });
  },

  createAdoption: async (petId: string, message?: string) => {
    return fetchClient('/adoptions', {
      method: 'POST',
      body: JSON.stringify({ petId, message }),
    });
  },

  getMyAdoptions: async () => {
    return fetchClient('/adoptions/my-requests');
  },

  // Assinar termo de responsabilidade
  signResponsibilityTerm: async (adoptionRequestId: string) => {
    return fetchClient(`/responsibility-terms/${adoptionRequestId}/sign`, {
      method: 'POST',
    });
  },

  uploadPetPhoto: async (petId: number, file: File) => {
    const token = localStorage.getItem('adotapet_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/pets/${petId}/photo`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });

    if (!response.ok) throw new Error('Erro ao fazer upload da foto');
    return response.json();
  },
};
