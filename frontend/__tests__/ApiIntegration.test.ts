import { api } from '@/services/api';

describe('Integração com API', () => {
    const mockToken = 'fake-jwt-token';
    const mockUser = { name: 'Lucas Teste', email: 'lucas@test.com', role: 'adopter' };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        global.fetch = jest.fn();
    });

    it('deve buscar pets com sucesso', async () => {
        const mockRawPets = [{
            id: 'cuid123',
            name: 'Thor',
            species: 'DOG',
            sex: 'MALE',
            size: 'LARGE',
            ageInMonths: 24,
            city: 'Santa Rita do Sapucaí',
            state: 'MG',
            breed: 'Labrador',
            description: 'Thor é um labrador',
            photoUrl: '/pets/thor.jpg',
        }];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRawPets,
        });

        const pets = await api.getPets();

        expect(pets[0].name).toBe('Thor');
        expect(pets[0].type).toBe('dog');
        expect(pets[0].age).toBe('2 anos');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/pets'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    it('deve incluir o token de autorização se estiver logado', async () => {
        localStorage.setItem('adotapet_token', mockToken);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        await api.getPets();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': `Bearer ${mockToken}`
                })
            })
        );
    });

    it('deve realizar login e retornar o token', async () => {
        const loginData = { email: 'test@test.com', password: 'password' };
        const mockResponse = { access_token: mockToken };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await api.login(loginData);

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/login'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(loginData)
            })
        );
    });

    it('deve lançar erro amigável se a API falhar', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Credenciais inválidas' }),
        });

        await expect(api.login({ email: 'a@a.com', password: '123' }))
            .rejects.toThrow('Credenciais inválidas');
    });
});