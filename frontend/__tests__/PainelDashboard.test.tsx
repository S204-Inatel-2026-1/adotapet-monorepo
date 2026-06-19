import { render, screen, waitFor } from '@testing-library/react';
import PainelPage from '@/app/painel/page';
import { api } from '@/services/api';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'ong-1', name: 'ONG Esperança' },
    isAuthenticated: true,
  })),
}));

// Mock do api service
jest.mock('@/services/api', () => ({
  api: {
    getPets: jest.fn(),
    getReceivedAdoptions: jest.fn(),
  },
}));

describe('PainelPage (Dashboard)', () => {
  const mockPets = [
    { id: '1', name: 'Thor', type: 'dog', breed: 'Labrador', size: 'large' },
    { id: '2', name: 'Nina', type: 'cat', breed: 'Siamês', size: 'small' },
  ];

  const mockAdoptions = [
    { id: 'a1', status: 'PENDING', pet: { name: 'Thor' }, user: { fullName: 'Lucas' } },
    { id: 'a2', status: 'APPROVED', pet: { name: 'Nina' }, user: { fullName: 'Maria' } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TESTES POSITIVOS (Funcionamento) ---

  it('1. deve renderizar a saudação correta para o usuário logado', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<PainelPage />);

    await waitFor(() => {
      expect(screen.getByText(/Bom dia, ONG!|Boa tarde, ONG!|Boa noite, ONG!/)).toBeInTheDocument();
    });
  });

  it('2. deve exibir as métricas corretas baseadas no retorno da API', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<PainelPage />);

    await waitFor(() => {
      // Pets cadastrados: 2
      const petsMetric = screen.getByText('Pets cadastrados').parentElement;
      expect(petsMetric).toHaveTextContent('2');
      
      // Solicitações pendentes: 1
      const pendingMetric = screen.getByText('Solicitações pendentes').parentElement;
      expect(pendingMetric).toHaveTextContent('1');
    });
  });

  it('3. deve listar as solicitações recentes corretamente', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<PainelPage />);

    await waitFor(() => {
      expect(screen.getByText('Lucas')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
  });

  // --- TESTE NEGATIVO (Funcionalidade) ---

  it('4. deve lidar com erro na API e manter as métricas em zero', async () => {
    // Silencia o console.error para o teste ficar limpo
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (api.getPets as jest.Mock).mockRejectedValue(new Error('API Failure'));
    (api.getReceivedAdoptions as jest.Mock).mockRejectedValue(new Error('API Failure'));

    render(<PainelPage />);

    await waitFor(() => {
      // Deve mostrar 0 nas métricas (exceto resgates que é mockado fixo por enquanto)
      const petsMetric = screen.getByText('Pets cadastrados').parentElement;
      expect(petsMetric).toHaveTextContent('0');
    });

    consoleSpy.mockRestore();
  });
});
