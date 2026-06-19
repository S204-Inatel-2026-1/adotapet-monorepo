import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NovoPetPage from '@/app/painel/pets/novo/page';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    createPet: jest.fn(),
    uploadPetPhoto: jest.fn(),
  },
}));

// Mock do URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('NovoPetPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<NovoPetPage />);
    expect(screen.getByText('Cadastrar novo pet')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do pet')).toBeInTheDocument();
    expect(screen.getByLabelText('Espécie')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    render(<NovoPetPage />);
    const submitBtn = screen.getByRole('button', { name: /Cadastrar pet/i });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Espécie é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Selecione o sexo')).toBeInTheDocument();
      // Usando queryAllByText para lidar com a duplicata (option + erro)
      expect(screen.getAllByText('Selecione o porte')[1]).toBeInTheDocument(); 
      expect(screen.getByText('Descreva o pet com pelo menos 10 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Informe a cidade')).toBeInTheDocument();
      expect(screen.getByText('Selecione o estado')).toBeInTheDocument();
    });
  });

  it('deve chamar createPet e uploadPetPhoto ao submeter com sucesso', async () => {
    (api.createPet as jest.Mock).mockResolvedValue({ id: 'pet-123' });
    (api.uploadPetPhoto as jest.Mock).mockResolvedValue({ success: true });

    render(<NovoPetPage />);

    fireEvent.change(screen.getByLabelText('Nome do pet'), { target: { value: 'Thor' } });
    fireEvent.change(screen.getByLabelText('Espécie'), { target: { value: 'DOG' } });
    fireEvent.click(screen.getByLabelText('♂ Macho'));
    fireEvent.change(screen.getByLabelText('Idade (em meses)'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('Porte'), { target: { value: 'LARGE' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Thor é um cão muito amigável e brincalhão.' } });
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Santa Rita' } });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'MG' } });

    // Simula upload de arquivo
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Escolher foto/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Cadastrar pet/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createPet).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Thor',
        species: 'DOG',
        sex: 'MALE',
        ageInMonths: 24,
        size: 'LARGE',
        description: 'Thor é um cão muito amigável e brincalhão.',
        city: 'Santa Rita',
        state: 'MG',
      }));
      expect(api.uploadPetPhoto).toHaveBeenCalledWith('pet-123', file);
    });

    expect(screen.getByText('Pet cadastrado com sucesso!')).toBeInTheDocument();
  });
});
