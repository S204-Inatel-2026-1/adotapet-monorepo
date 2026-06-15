import { api, decodeJwtPayload, normalizePet, normalizeUser } from '@/services/api';

// Mock do fetch global
global.fetch = jest.fn();
// Mock do atob para ambiente Node (Jest)
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

describe('API Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('adotapet_token', 'fake-token');
  });

  describe('Utility Functions', () => {
    it('should decode JWT payload correctly', () => {
      const payload = { sub: '123', name: 'Test' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      expect(decodeJwtPayload(token)).toEqual(payload);
    });

    it('should return null for invalid JWT', () => {
      expect(decodeJwtPayload('invalid-token')).toBeNull();
    });

    it('should normalize user data correctly', () => {
      const rawUser = { fullName: 'Lucas Teste', email: 'l@t.com', role: 'ADOPTER' };
      const normalized = normalizeUser(rawUser);
      expect(normalized).toEqual({
        name: 'Lucas Teste',
        email: 'l@t.com',
        role: 'adopter',
        avatar: undefined
      });
    });

    it('should normalize pet data correctly', () => {
      const rawPet = {
        id: '1',
        name: 'Thor',
        species: 'DOG',
        ageInMonths: 24,
        size: 'LARGE',
        sex: 'MALE',
        city: 'Santa Rita',
        state: 'MG'
      };
      const normalized = normalizePet(rawPet);
      expect(normalized.name).toBe('Thor');
      expect(normalized.type).toBe('dog');
      expect(normalized.age).toBe('2 anos');
      expect(normalized.size).toBe('large');
      expect(normalized.location).toBe('Santa Rita – MG');
    });
  });

  describe('API Methods', () => {
    it('should call getPets and handle array response', async () => {
      const mockPets = [{ id: '1', name: 'Thor', species: 'DOG' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPets,
      });

      const result = await api.getPets();
      expect(result[0].name).toBe('Thor');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/pets'), expect.anything());
    });

    it('should call getPets with registeredById filter', async () => {
      const mockPets = [{ id: '1', name: 'Thor', species: 'DOG' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPets,
      });

      await api.getPets({ registeredById: 'user-123' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets?registeredById=user-123'),
        expect.anything()
      );
    });

    it('should call getPetById', async () => {
      const mockPet = { id: '1', name: 'Thor', species: 'DOG' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPet,
      });

      const result = await api.getPetById('1');
      expect(result.name).toBe('Thor');
    });

    it('should call updateUser with correct payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', fullName: 'New Name' }),
      });

      await api.updateUser('1', { name: 'New Name', email: 'n@e.com' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            fullName: 'New Name',
            email: 'n@e.com',
          }),
        })
      );
    });

    it('should call login and return token', async () => {
      const mockResponse = { access_token: 'new-token' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login({ email: 't@t.com', password: '123' });
      expect(result).toEqual(mockResponse);
    });

    it('should call register with correct role', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1' }),
      });

      await api.register({ name: 'User', email: 'u@t.com', password: '123' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"role":"ADOPTER"'),
        })
      );
    });

    it('should call createAdoption with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'req-123', status: 'PENDING' }),
      });

      const petId = 'pet-123';
      const message = 'Test motivation message';
      
      await api.createAdoption(petId, message);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/adoptions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ petId, message }),
        })
      );
    });

    it('should call getMyAdoptions and return data', async () => {
      const mockData = [{ id: 'req-1', petId: 'pet-1' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getMyAdoptions();
      expect(result).toEqual(mockData);
    });

    it('should call signResponsibilityTerm with correct ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.signResponsibilityTerm('req-789');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/responsibility-terms/req-789/sign'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should call registerOrganization with correct payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'org-1' }),
      });

      const orgData = {
        fullName: 'Admin',
        email: 'admin@ong.com',
        password: 'Password1!',
        legalName: 'ONG Teste',
        cnpj: '12.345.678/0001-90',
        city: 'Santa Rita',
        state: 'MG'
      };

      await api.registerOrganization(orgData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/organizations/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fullName: 'Admin',
            email: 'admin@ong.com',
            password: 'Password1!',
            legalName: 'ONG Teste',
            cnpj: '12345678000190',
            city: 'Santa Rita',
            state: 'MG'
          })
        })
      );
    });

    it('should call getOrganizationMe', async () => {
      const mockOrg = { id: 'org-1', legalName: 'ONG Teste' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrg,
      });

      const result = await api.getOrganizationMe();
      expect(result).toEqual(mockOrg);
    });

    it('should call getReceivedAdoptions', async () => {
      const mockAdoptions = [{ id: 'adoc-1', petId: 'pet-1' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAdoptions,
      });

      const result = await api.getReceivedAdoptions();
      expect(result).toEqual(mockAdoptions);
    });

    it('should call updateAdoptionStatus', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'adoc-1', status: 'APPROVED' }),
      });

      await api.updateAdoptionStatus('adoc-1', 'APPROVED');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/adoptions/adoc-1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'APPROVED' })
        })
      );
    });

    it('should call createPet with correct payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'pet-1' }),
      });

      const petData = { name: 'Thor', species: 'DOG' };
      await api.createPet(petData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(petData)
        })
      );
    });

    it('should call updatePet with correct payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'pet-1' }),
      });

      const petData = { name: 'Thor updated' };
      await api.updatePet('pet-1', petData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets/pet-1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(petData)
        })
      );
    });

    it('should call changePassword', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.changePassword('user-1', 'NewPass123!');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/user-1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ password: 'NewPass123!' })
        })
      );
    });

    it('should call deleteAccount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.deleteAccount('user-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/user-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should call uploadPetPhoto with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photoUrl: 'http://img.com/p1.jpg' }),
      });

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      await api.uploadPetPhoto(1, file);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pets/1/photo'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    it('should throw error when API returns not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Error message from server' }),
      });

      await expect(api.getPets()).rejects.toThrow('Error message from server');
    });
  });
});
