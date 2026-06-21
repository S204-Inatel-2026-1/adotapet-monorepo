import { middleware } from '@/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock do next/server para interceptar as chamadas estáticas
jest.mock('next/server', () => {
  return {
    NextResponse: {
      next: jest.fn().mockReturnValue({ type: 'next' }),
      redirect: jest.fn((url: URL | string) => ({ type: 'redirect', url: url.toString() })),
      rewrite: jest.fn((url: URL | string) => ({ type: 'rewrite', url: url.toString() })),
    },
  };
});

describe('Middleware Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // Função helper para simular o NextRequest de forma limpa
  const createMockRequest = (pathname: string, token?: string, search = ''): NextRequest => {
    const url = `http://localhost:3000${pathname}${search}`;
    return {
      nextUrl: {
        pathname,
        search,
      },
      cookies: {
        get: jest.fn().mockImplementation((name: string) => {
          if (name === 'adotapet_token' && token) {
            return { value: token };
          }
          return undefined;
        }),
      },
      url,
    } as unknown as NextRequest;
  };

  describe('1. Rota de Proxy do Backend', () => {
    it('deve reescrever requisições /api-backend/* para o backend usando o BACKEND_URL definido', () => {
      process.env.BACKEND_URL = 'https://meu-backend.com';
      const request = createMockRequest('/api-backend/pets', undefined, '?status=available');

      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledWith(
        new URL('https://meu-backend.com/pets?status=available')
      );
    });

    it('deve usar o localhost:3000 como fallback de backend para reescrever /api-backend/*', () => {
      delete process.env.BACKEND_URL;
      const request = createMockRequest('/api-backend/users/123');

      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledWith(
        new URL('http://localhost:3000/users/123')
      );
    });

    it('deve reescrever requisições de upload de arquivos (/uploads/*)', () => {
      process.env.BACKEND_URL = 'http://meu-servidor-uploads.com';
      const request = createMockRequest('/uploads/pet-photo.jpg');

      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledWith(
        new URL('http://meu-servidor-uploads.com/uploads/pet-photo.jpg')
      );
    });
  });

  describe('2. Proteção de Rotas Privadas (Não Autenticado)', () => {
    const privateRoutes = ['/dashboard', '/perfil', '/minhas-solicitacoes', '/painel', '/ajuda'];

    privateRoutes.forEach((route) => {
      it(`deve redirecionar usuário não autenticado da rota privada ${route} para /login`, () => {
        const request = createMockRequest(route);

        middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL('http://localhost:3000/login')
        );
      });
    });

    it('deve redirecionar para /login se o cookie adotapet_token estiver presente mas estiver vazio', () => {
      const request = createMockRequest('/dashboard', '');

      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('http://localhost:3000/login')
      );
    });

    it('deve redirecionar para /login se outros cookies estiverem presentes mas o adotapet_token estiver ausente', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard',
          search: '',
        },
        cookies: {
          get: jest.fn().mockImplementation((name: string) => {
            if (name === 'other_cookie') {
              return { value: 'some-value' };
            }
            return undefined;
          }),
        },
        url: 'http://localhost:3000/dashboard',
      } as unknown as NextRequest;

      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('http://localhost:3000/login')
      );
    });
  });


  describe('3. Acesso a Rotas Privadas (Autenticado)', () => {
    const privateRoutes = ['/dashboard', '/perfil', '/minhas-solicitacoes', '/painel', '/ajuda'];

    privateRoutes.forEach((route) => {
      it(`deve permitir acesso do usuário autenticado à rota privada ${route}`, () => {
        const request = createMockRequest(route, 'token-valido-jwt');

        const response = middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(response).toEqual({ type: 'next' });
      });
    });
  });

  describe('4. Acesso a Rotas de Autenticação (Login e Registro)', () => {
    const authRoutes = ['/login', '/registro'];

    authRoutes.forEach((route) => {
      it(`deve redirecionar usuário autenticado tentando acessar ${route} para o /dashboard`, () => {
        const request = createMockRequest(route, 'token-valido-jwt');

        middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL('http://localhost:3000/dashboard')
        );
      });

      it(`deve permitir acesso de usuário não autenticado à rota ${route}`, () => {
        const request = createMockRequest(route);

        const response = middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(response).toEqual({ type: 'next' });
      });
    });
  });

  describe('5. Rotas Públicas Comuns', () => {
    const publicRoutes = ['/', '/contato', '/faq', '/denunciar', '/resgate'];

    publicRoutes.forEach((route) => {
      it(`deve permitir acesso livre à rota pública ${route} mesmo sem estar logado`, () => {
        const request = createMockRequest(route);

        const response = middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(response).toEqual({ type: 'next' });
      });
    });
  });
});
