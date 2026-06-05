describe('Fluxo de Autenticação e Proteção de Rotas', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.intercept('POST', '/api-backend/auth/login', {
      statusCode: 200,
      body: { access_token: 'fake-jwt-token' },
    }).as('loginRequest');

    cy.intercept('GET', '/api-backend/users/*', {
      statusCode: 200,
      body: {
        fullName: 'Lucas Teste',
        email: 'lucas@test.com',
        role: 'ADOPTER',
      },
    }).as('getUserRequest');

    cy.intercept('POST', '/api-backend/users', {
      statusCode: 201,
      body: { id: 'user-123', email: 'novo@usuario.com' },
    }).as('registerRequest');
  });

  it('deve redirecionar para login ao tentar acessar dashboard sem estar logado', () => {
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  it('deve realizar login, salvar cookies e redirecionar para o dashboard', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('teste@cypress.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.wait('@getUserRequest');

    cy.url().should('include', '/dashboard');

    cy.contains(/Bom dia|Boa tarde|Boa noite, Lucas!/).should('be.visible');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.eq('fake-jwt-token');
      expect(win.localStorage.getItem('adotapet_user')).to.contain('Lucas Teste');
    });

    cy.getCookie('adotapet_token').should('have.property', 'value', 'fake-jwt-token');
  });

  it('deve permitir acesso ao dashboard se já possuir cookie/token', () => {
    cy.setCookie('adotapet_token', 'fake-jwt-token');
    cy.window().then((win) => {
      win.localStorage.setItem('adotapet_token', 'fake-jwt-token');
      win.localStorage.setItem('adotapet_user', JSON.stringify({ name: 'Lucas Teste', role: 'adopter' }));
    });

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains(/Bom dia|Boa tarde|Boa noite, Lucas!/).should('be.visible');
  });

  it('deve realizar logout completo e remover acessos', () => {
    cy.setCookie('adotapet_token', 'fake-jwt-token');
    cy.window().then((win) => {
      win.localStorage.setItem('adotapet_token', 'fake-jwt-token');
      win.localStorage.setItem('adotapet_user', JSON.stringify({ name: 'Lucas Teste', role: 'adopter' }));
    });
    cy.visit('/dashboard');

    cy.get('button[aria-label="Abrir menu do usuário"]').click();
    cy.contains(/sair da conta/i).should('be.visible').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.getCookie('adotapet_token').should('not.exist');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.be.null;
    });
  });
});