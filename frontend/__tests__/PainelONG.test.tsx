import { render, screen, waitFor } from '@testing-library/react';
import { api } from '@/services/api';
import PainelPage from '@/app/painel/page';
import { AuthProvider } from '@/contexts/AuthContext';

// Mocks
jest.mock('@/services/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/components/layout/OngHeader', () => {
  const MockOngHeader = () => <div data-testid="ong-header" />;
  MockOngHeader.displayName = 'OngHeader';
  return MockOngHeader;
});
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'ong-1', name: 'ONG Teste', role: 'ong' },
    isAuthenticated: true,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockPets = [
  { id: 'pet-1', name: 'Thor', type: 'dog', breed: 'Labrador', size: 'large' },
  { id: 'pet-2', name: 'Nina', type: 'cat', breed: 'Siamês', size: 'small' },
];

const mockAdoptions = [
  {
    id: 'adoc-1',
    status: 'PENDING',
    pet: { name: 'Thor' },
    user: { fullName: 'João Silva' },
  },
  {
    id: 'adoc-2',
    status: 'APPROVED',
    pet: { name: 'Nina' },
    user: { fullName: 'Maria Souza' },
  },
];

describe('PainelPage (ONG Dashboard) - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render statistics correctly based on API data', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(
      <AuthProvider>
        <PainelPage />
      </AuthProvider>
    );

    await waitFor(() => {
      // Total de pets: 2 (Aparece no card e no header da seção)
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
      // Solicitações pendentes: 1
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should render recent adoptions list', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue(mockAdoptions);

    render(
      <AuthProvider>
        <PainelPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('quer adotar Thor')).toBeInTheDocument();
    });
  });

  it('should show empty state message for pets', async () => {
    (api.getPets as jest.Mock).mockResolvedValue([]);
    (api.getReceivedAdoptions as jest.Mock).mockResolvedValue([]);

    render(
      <AuthProvider>
        <PainelPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum pet cadastrado/i)).toBeInTheDocument();
    });
  });
});
