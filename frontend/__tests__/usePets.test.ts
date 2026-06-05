import { renderHook, waitFor } from '@testing-library/react';
import { usePets } from '@/hooks/usePets';
import { api } from '@/services/api';

// Mock do serviço de API
jest.mock('@/services/api');

const mockPets = [
  { id: '1', name: 'Thor', type: 'dog' },
  { id: '2', name: 'Luna', type: 'cat' },
];

describe('usePets Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch pets successfully', async () => {
    (api.getPets as jest.Mock).mockResolvedValue(mockPets);

    const { result } = renderHook(() => usePets());

    // Estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.pets).toEqual([]);

    // Esperar a conclusão do fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pets).toEqual(mockPets);
    expect(result.current.error).toBeNull();
    expect(api.getPets).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Erro de conexão';
    (api.getPets as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pets).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });
});
