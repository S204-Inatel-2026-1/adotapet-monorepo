import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PainelAdocoesPage from '@/app/painel/adocoes/page';
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
    getReceivedAdoptions: jest.fn(),
    updateAdoptionStatus: jest.fn(),
  },
}));

describe('PainelAdocoesPage', () => {
  const mockAdoptions = [
    {
      id: 'a1',
      status: 'PENDING',
      createdAt: '2026-06-01T10:00:00Z',
      message: 'Mensagem do Lucas',
      pet: { name: 'Thor', photoUrl: '/thor.jpg' },
      user: { fullName: 'Lucas Santos', email: 'lucas@test.com', phone: '123456' }
    },
    {
      id: 'a2',
      status: 'APPROVED',
      createdAt: '2026-05-20T10:00:00Z',
      message: 'Mensagem da Maria',
      pet: { name: 'Luna', photoUrl: '/luna.jpg' },
      user: { fullName: 'Maria Silva', email: 'maria@test.com' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TESTES POSITIVOS (Funcionamento) ---

  it('1. deve listar as solicitações recebidas corretamente', async () => {
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<PainelAdocoesPage />);

    await waitFor(() => {
      expect(screen.getByText('Lucas Santos')).toBeInTheDocument();
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });
    // Verifica se o contador no badge aparece
    expect(screen.getAllByText(/1 pendente/i).length).toBeGreaterThanOrEqual(1);
  });

  it('2. deve abrir o modal de detalhes ao clicar em uma solicitação', async () => {
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<PainelAdocoesPage />);

    const cardLucas = await screen.findByText('Lucas Santos');
    fireEvent.click(cardLucas);

    expect(screen.getByText('Detalhes da Solicitação')).toBeInTheDocument();
    // No modal, a mensagem tem uma classe específica ou contexto diferente
    expect(screen.getByText('lucas@test.com')).toBeInTheDocument();
    expect(screen.getAllByText('Mensagem do Lucas').length).toBeGreaterThanOrEqual(1);
  });

  it('3. deve chamar a API para aprovar uma solicitação', async () => {
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    (api.updateAdoptionStatus as jest.Mock).mockResolvedValue({ success: true });

    render(<PainelAdocoesPage />);

    const cardLucas = await screen.findByText('Lucas Santos');
    fireEvent.click(cardLucas);

    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(api.updateAdoptionStatus).toHaveBeenCalledWith('a1', 'APPROVED');
    });
  });

  // --- TESTE NEGATIVO (Funcionalidade) ---

  it('4. deve lidar com erro ao carregar as solicitações e exibir lista vazia', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (api.getReceivedAdoptions as jest.Mock).mockRejectedValue(new Error('Falha na API'));

    render(<PainelAdocoesPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma solicitação aqui')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
