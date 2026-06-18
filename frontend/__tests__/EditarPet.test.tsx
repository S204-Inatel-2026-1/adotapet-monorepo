import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditarPetPage from '@/app/painel/pets/[id]/editar/page';
import { api } from '@/services/api';
import { useRouter, useParams } from 'next/navigation';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock do auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'ong-123', name: 'ONG Teste' },
    isAuthenticated: true,
  })),
}));

// Mock do api service
jest.mock('@/services/api', () => ({
  api: {
    getPetById: jest.fn(),
    updatePet: jest.fn(),
    uploadPetPhoto: jest.fn(),
  },
}));

// Mock do URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('EditarPetPage', () => {
  const mockPush = jest.fn();
  const mockPet = {
    id: 'pet-123',
    name: 'Thor Original',
    type: 'dog',
    breed: 'Labrador',
    gender: 'male',
    age: '2 anos',
    size: 'large',
    location: 'Santa Rita – MG',
    description: 'Descrição original do Thor.',
    tags: ['Amigável'],
    image: 'http://img.com/thor.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: 'pet-123' });
    (api.getPetById as jest.Mock).mockResolvedValue(mockPet);
  });

  it('deve carregar os dados do pet e preencher o formulário', async () => {
    render(<EditarPetPage />);
    
    // Espera o loading sumir e o campo aparecer
    const nameInput = await screen.findByLabelText('Nome do pet');
    
    expect(api.getPetById).toHaveBeenCalledWith('pet-123');
    expect(nameInput).toHaveValue('Thor Original');
    expect(screen.getByLabelText('Espécie')).toHaveValue('DOG');
    expect(screen.getByLabelText('♂ Macho')).toBeChecked();
    expect(screen.getByLabelText('Porte')).toHaveValue('LARGE');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Descrição original do Thor.');
  });

  it('deve chamar updatePet e uploadPetPhoto ao salvar alterações', async () => {
    (api.updatePet as jest.Mock).mockResolvedValue({ success: true });
    (api.uploadPetPhoto as jest.Mock).mockResolvedValue({ success: true });

    render(<EditarPetPage />);

    const nameInput = await screen.findByLabelText('Nome do pet');
    fireEvent.change(nameInput, { target: { value: 'Thor Editado' } });
    
    // Simula upload de nova foto
    const file = new File([''], 'new-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Escolher foto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Salvar alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.updatePet).toHaveBeenCalledWith('pet-123', expect.objectContaining({
        name: 'Thor Editado',
      }));
      expect(api.uploadPetPhoto).toHaveBeenCalledWith('pet-123', file);
    });

    expect(screen.getByText(/Pet atualizado com sucesso/i)).toBeInTheDocument();
  });
});
