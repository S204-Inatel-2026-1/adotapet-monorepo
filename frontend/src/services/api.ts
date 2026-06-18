// src/services/api.ts

import { Pet } from '@/types/pets';
import { AuthUser, UserRole } from '@/contexts/AuthContext';

const API_BASE_URL = '/api-backend';

interface DecodedToken {
  sub?: string | number;
  [key: string]: unknown;
}

// Decodifica o payload do JWT sem biblioteca
export function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as DecodedToken;
  } catch {
    return null;
  }
}

// Normaliza o retorno bruto do backend para o tipo AuthUser
export function normalizeUser(raw: Record<string, unknown>): AuthUser {
  const data = raw as Record<string, unknown>;
  const rawRole = ((data?.role as string) ?? (data?.tipo as string) ?? 'adopter').toLowerCase();
  const role: UserRole = rawRole === 'ong_admin' ? 'ong' : 'adopter';

  return {
    id:     (data?.id as string | number) ?? '',
    name:   (data?.fullName as string) ?? (data?.name as string) ?? (data?.nome as string) ?? (data?.username as string) ?? 'Usuário',
    email:  (data?.email as string) ?? '',
    role,
    avatar: (data?.avatar as string) ?? (data?.photo as string) ?? undefined,
  };
}

export function normalizePet(raw: Record<string, unknown>): Pet {
  const data = raw as Record<string, unknown>;
  // Converte ageInMonths para texto legível
  const ageMonths = (data?.ageInMonths as number) ?? 0;
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
  const location = data?.city && data?.state
    ? `${data.city} – ${data.state}`
    : (data?.city as string) ?? (data?.state as string) ?? '';

  return {
    id:          data?.id?.toString() ?? '',
    name:        (data?.name as string) ?? '',
    image:       (data?.photoUrl as string) ?? (data?.image as string) ?? '/pets/default.jpg',
    type:        speciesMap[(data?.species as string) ?? (data?.type as string)] ?? 'dog',
    breed:       (data?.breed as string) ?? '',
    gender:      genderMap[(data?.sex as string) ?? (data?.gender as string)] ?? 'male',
    age:         ageLabel,
    size:        sizeMap[data?.size as string] ?? 'medium',
    location,
    description: (data?.description as string) ?? '',
    tags: data?.tags
      ? (data.tags as string).split(',').map((t: string) => t.trim())
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
  getPets: async (filters?: { registeredById?: string | number }): Promise<Pet[]> => {
    let endpoint = '/pets';
    if (filters?.registeredById) {
      endpoint += `?registeredById=${filters.registeredById}`;
    }
    const data = await fetchClient(endpoint);
    // Backend pode retornar array direto ou { data: [...] }
    const list = Array.isArray(data) ? data : data.data ?? data.pets ?? [];
    return list.map((item: Record<string, unknown>) => normalizePet(item));
  },

  getPetById: async (id: number | string): Promise<Pet> => {
    const data = await fetchClient(`/pets/${id}`);
    return normalizePet(data as Record<string, unknown>);
  },

  createPet: async (petData: Record<string, unknown>) => {
    return fetchClient('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  },

  updatePet: async (id: string | number, petData: Record<string, unknown>) => {
    return fetchClient(`/pets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(petData),
    });
  },

  getUserById: async (id: string | number) => {
    return fetchClient(`/users/${id}`);
  },

  // Atualizar dados do usuário
  updateUser: async (id: string, userData: Record<string, unknown>) => {
    const data = userData as Record<string, string>;
    return fetchClient(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
      }),
    });
  },

  changePassword: async (id: string, password: string) => {
    return fetchClient(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },

  deleteAccount: async (id: string) => {
    return fetchClient(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  login: async (credentials: Record<string, unknown>) => {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: Record<string, unknown>) => {
    const data = userData as Record<string, string>;
    return fetchClient('/users', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone,
        role:     data.role ?? 'ADOPTER',
      }),
    });
  },

  registerOrganization: async (data: Record<string, unknown>) => {
    const orgData = data as Record<string, string>;
    return fetchClient('/organizations/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName:    orgData.fullName,
        email:       orgData.email,
        password:    orgData.password,
        phone:       orgData.phone,
        legalName:   orgData.legalName,
        tradeName:   orgData.tradeName,
        cnpj:        orgData.cnpj?.replace(/\D/g, ''),
        description: orgData.description,
        city:        orgData.city,
        state:       orgData.state,
      }),
    });
  },

  getOrganizationMe: async () => {
    return fetchClient('/organizations/me');
  },

  updateOrganizationMe: async (data: Record<string, unknown>) => {
    return fetchClient('/organizations/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getReceivedAdoptions: async () => {
    return fetchClient('/adoptions/received');
  },

  updateAdoptionStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    return fetchClient(`/adoptions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
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

  deletePet: async (id: string | number) => {
    return fetchClient(`/pets/${id}`, {
      method: 'DELETE',
    });
  },

  uploadPetPhoto: async (petId: string | number, file: File) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adotapet_token') : null;
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
