import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MinhasSolicitacoesPage from '@/app/minhas-solicitacoes/page';
import { api } from '@/services/api';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', name: 'Lucas' },
    isAuthenticated: true,
  })),
}));

// Mock do api service
jest.mock('@/services/api', () => ({
  api: {
    getMyAdoptions: jest.fn(),
    signResponsibilityTerm: jest.fn(),
  },
}));

describe('MinhasSolicitacoesPage', () => {
  const mockAdoptions = [
    {
      id: 'a1',
      status: 'PENDING',
      createdAt: '2026-06-01T10:00:00Z',
      message: 'Mensagem 1',
      pet: { name: 'Thor', breed: 'Labrador', species: 'DOG' }
    },
    {
      id: 'a2',
      status: 'APPROVED',
      createdAt: '2026-05-20T10:00:00Z',
      message: 'Mensagem 2',
      pet: { name: 'Luna', breed: 'Siamês', species: 'CAT' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TESTES POSITIVOS (Funcionamento) ---

  it('1. deve listar as adoções do usuário corretamente', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<MinhasSolicitacoesPage />);

    await waitFor(() => {
      expect(screen.getByText('Thor')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('2. deve abrir o modal de detalhes ao clicar em uma adoção', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(<MinhasSolicitacoesPage />);

    const cardThor = await screen.findByText('Thor');
    fireEvent.click(cardThor);

    expect(screen.getByText('Sua mensagem')).toBeInTheDocument();
    expect(screen.getByText('"Mensagem 1"')).toBeInTheDocument();
  });

  it('3. deve chamar a API de assinatura do termo ao clicar no botão de assinar', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    (api.signResponsibilityTerm as jest.Mock).mockResolvedValue({ success: true });
    // Mock do window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<MinhasSolicitacoesPage />);

    // Luna está aprovada (APPROVED) no mock
    const cardLuna = await screen.findByText('Luna');
    fireEvent.click(cardLuna);

    const signBtn = screen.getByRole('button', { name: /Assinar termo/i });
    fireEvent.click(signBtn);

    await waitFor(() => {
      expect(api.signResponsibilityTerm).toHaveBeenCalledWith('a2');
      expect(alertSpy).toHaveBeenCalledWith('Termo assinado com sucesso! 🐾');
    });

    alertSpy.mockRestore();
  });

  // --- TESTE NEGATIVO (Funcionalidade) ---

  it('4. deve lidar com erro ao assinar o termo e exibir alerta de erro', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    (api.signResponsibilityTerm as jest.Mock).mockRejectedValue(new Error('Falha na assinatura'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<MinhasSolicitacoesPage />);

    const cardLuna = await screen.findByText('Luna');
    fireEvent.click(cardLuna);

    const signBtn = screen.getByRole('button', { name: /Assinar termo/i });
    fireEvent.click(signBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Falha na assinatura');
    });

    alertSpy.mockRestore();
  });
});
