// src/types/pets.ts
// ÚNICO tipo Pet do projeto — importar daqui em todos os componentes

export type Pet = {
  id: string; // ← era number, backend usa cuid (string)
  name: string;
  image: string;
  type: 'dog' | 'cat';
  breed: string;
  gender: 'male' | 'female';
  age: string;
  size: 'small' | 'medium' | 'large';
  location: string;
  description: string;
  tags?: string[];
  status?: 'available' | 'pending' | 'adopted';
  pendingAdoptions?: number;
};
