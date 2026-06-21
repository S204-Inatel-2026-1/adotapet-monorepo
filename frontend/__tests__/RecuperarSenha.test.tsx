import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecuperarSenha from '@/app/recuperar-senha/page';
import { api } from '@/services/api';

// Mock do next/navigation
const mockPush = jest.fn();
const mockGetToken = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
  useSearchParams() {
    return {
      get: mockGetToken,
    };
  },
}));

// Mock do api service
jest.mock('@/services/api', () => ({
  api: {
    resetPassword: jest.fn(),
  },
}));

// Mock do BackToHome para evitar erros de AuthContext
jest.mock('@/components/ui/BackToHome', () => {
  return function DummyBackToHome() {
    return <div data-testid="back-to-home" />;
  };
});

describe('Recuperar Senha Page - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReturnValue('token-jwt-valido');
  });

  it('deve exibir mensagem de erro caso o token de redefinição esteja ausente', () => {
    mockGetToken.mockReturnValue(null); // Sem token na URL

    render(<RecuperarSenha />);

    expect(screen.getByText('Token de redefinição inválido ou expirado.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Nova senha')).not.toBeInTheDocument();
  });

  it('deve renderizar os campos de senha se o token for fornecido', () => {
    render(<RecuperarSenha />);

    expect(screen.getByText('Criar Nova Senha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua nova senha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirme sua nova senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar nova senha/i })).toBeInTheDocument();
  });

  it('deve validar tamanho mínimo da senha', async () => {
    render(<RecuperarSenha />);

    const passwordInput = screen.getByPlaceholderText('Digite sua nova senha');
    const confirmInput = screen.getByPlaceholderText('Confirme sua nova senha');
    const submitButton = screen.getByRole('button', { name: /salvar nova senha/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText('A senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('deve validar se as senhas coincidem', async () => {
    render(<RecuperarSenha />);

    const passwordInput = screen.getByPlaceholderText('Digite sua nova senha');
    const confirmInput = screen.getByPlaceholderText('Confirme sua nova senha');
    const submitButton = screen.getByRole('button', { name: /salvar nova senha/i });

    fireEvent.change(passwordInput, { target: { value: 'SenhaForte123!' } });
    fireEvent.change(confirmInput, { target: { value: 'SenhaDiferente123!' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument();
  });

  it('deve redefinir senha com sucesso ao preencher senhas válidas e coincidentes', async () => {
    (api.resetPassword as jest.Mock).mockResolvedValue({ success: true });

    render(<RecuperarSenha />);

    const passwordInput = screen.getByPlaceholderText('Digite sua nova senha');
    const confirmInput = screen.getByPlaceholderText('Confirme sua nova senha');
    const submitButton = screen.getByRole('button', { name: /salvar nova senha/i });

    fireEvent.change(passwordInput, { target: { value: 'NovaSenha123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NovaSenha123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.resetPassword).toHaveBeenCalledWith('token-jwt-valido', 'NovaSenha123!');
    });

    // Exibe tela de sucesso
    expect(await screen.findByText('Senha alterada com sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Sua senha foi redefinida e você já pode fazer login.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Digite sua nova senha')).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de erro se a requisição da API falhar', async () => {
    (api.resetPassword as jest.Mock).mockRejectedValue(new Error('Token expirado'));

    render(<RecuperarSenha />);

    const passwordInput = screen.getByPlaceholderText('Digite sua nova senha');
    const confirmInput = screen.getByPlaceholderText('Confirme sua nova senha');
    const submitButton = screen.getByRole('button', { name: /salvar nova senha/i });

    fireEvent.change(passwordInput, { target: { value: 'NovaSenha123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NovaSenha123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.resetPassword).toHaveBeenCalledWith('token-jwt-valido', 'NovaSenha123!');
    });

    expect(await screen.findByText('Token expirado')).toBeInTheDocument();
  });
});
