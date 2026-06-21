import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EsqueceuSenha from '@/app/esqueceu-senha/page';
import { api } from '@/services/api';

// Mock do router do Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
}));

// Mock do módulo api
jest.mock('@/services/api', () => ({
  api: {
    requestPasswordReset: jest.fn(),
  },
}));

// Mock do BackToHome para evitar erros de AuthContext
jest.mock('@/components/ui/BackToHome', () => {
  return function DummyBackToHome() {
    return <div data-testid="back-to-home" />;
  };
});

describe('Esqueceu Senha Page - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a tela de esqueceu senha com os campos básicos', () => {
    render(<EsqueceuSenha />);

    expect(screen.getByText('Recuperar Senha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument();
  });

  it('deve exibir erro de validação ao enviar e-mail vazio ou inválido', async () => {
    render(<EsqueceuSenha />);

    const submitButton = screen.getByRole('button', { name: /enviar link/i });
    fireEvent.click(submitButton);

    // Validação de e-mail obrigatório
    expect(await screen.findByText('O e-mail é obrigatório')).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(submitButton);

    // Validação de formato de e-mail
    expect(await screen.findByText('Digite um formato de e-mail válido')).toBeInTheDocument();
  });

  it('deve disparar a API e exibir tela de sucesso ao submeter e-mail válido', async () => {
    (api.requestPasswordReset as jest.Mock).mockResolvedValue({ message: 'E-mail enviado' });

    render(<EsqueceuSenha />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /enviar link/i });

    fireEvent.change(emailInput, { target: { value: 'cadastrado@teste.com' } });
    fireEvent.click(submitButton);

    // Espera a API ser chamada
    await waitFor(() => {
      expect(api.requestPasswordReset).toHaveBeenCalledWith('cadastrado@teste.com');
    });

    // Deve exibir mensagem de sucesso
    expect(await screen.findByText('E-mail de recuperação enviado!')).toBeInTheDocument();
    expect(screen.getByText(/Enviamos um link com as instruções/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('seu@email.com')).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de erro caso o e-mail não esteja cadastrado na API', async () => {
    (api.requestPasswordReset as jest.Mock).mockRejectedValue(new Error('E-mail não encontrado'));

    render(<EsqueceuSenha />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /enviar link/i });

    fireEvent.change(emailInput, { target: { value: 'nao_cadastrado@teste.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.requestPasswordReset).toHaveBeenCalledWith('nao_cadastrado@teste.com');
    });

    // Exibe o erro retornado
    expect(await screen.findByText('E-mail não encontrado')).toBeInTheDocument();
  });
});
