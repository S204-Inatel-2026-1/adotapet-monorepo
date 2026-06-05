import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { api } from '@/services/api';
import MinhasAdocoesPage from '@/app/minhas-adocoes/page';

// Mocks
jest.mock('@/services/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock('@/components/layout/PrivateHeader', () => () => <div data-testid="private-header" />);
jest.mock('@/components/ui/BackButton', () => ({ href, label }: any) => <button>{label}</button>);

const mockAdoptions = [
  {
    id: 'req-1',
    status: 'PENDING',
    createdAt: '2025-06-01T10:00:00Z',
    pet: {
      name: 'Thor',
      photoUrl: '/thor.jpg',
      breed: 'Vira-lata',
    },
  },
  {
    id: 'req-2',
    status: 'APPROVED',
    createdAt: '2025-05-15T10:00:00Z',
    pet: {
      name: 'Luna',
      photoUrl: '/luna.jpg',
      breed: 'Siamês',
    },
  },
];

describe('MinhasAdocoesPage - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (api.getMyAdoptions as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<MinhasAdocoesPage />);
    expect(screen.getByText(/Carregando suas adoções.../i)).toBeInTheDocument();
  });

  it('should render list of adoptions when data is loaded', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    
    render(<MinhasAdocoesPage />);

    await waitFor(() => {
      expect(screen.getByText('Thor')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Aprovada')).toBeInTheDocument();
  });

  it('should show empty state when no adoptions exist', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue([]);
    
    render(<MinhasAdocoesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma adoção ainda/i)).toBeInTheDocument();
    });
  });

  it('should show sign term alert when an adoption is approved', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    
    render(<MinhasAdocoesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Adoção aprovada! Assine o termo de responsabilidade/i)).toBeInTheDocument();
    });

    const signButton = screen.getByRole('button', { name: /Assinar termo/i });
    expect(signButton).toBeInTheDocument();
  });

  it('should call signResponsibilityTerm API when clicking sign button', async () => {
    (api.getMyAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);
    (api.signResponsibilityTerm as jest.Mock).mockResolvedValue({ success: true });
    window.alert = jest.fn();

    render(<MinhasAdocoesPage />);

    await waitFor(() => screen.getByRole('button', { name: /Assinar termo/i }));
    
    fireEvent.click(screen.getByRole('button', { name: /Assinar termo/i }));

    await waitFor(() => {
      expect(api.signResponsibilityTerm).toHaveBeenCalledWith('req-2');
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('sucesso'));
    });
  });
});
