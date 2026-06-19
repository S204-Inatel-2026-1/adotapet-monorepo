describe('Authentication and Route Protection - E2E', () => {
  // JWT fake decodificavel (sub + role), reutilizado no mock e nas assercoes
  const FAKE_TOKEN = `header.${btoa(JSON.stringify({ sub: 'user-123', role: 'ADOPTER' }))}.signature`;

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Mocks padrão
    cy.intercept('POST', '**/api-backend/auth/login', {
      statusCode: 200,
      body: { access_token: FAKE_TOKEN },
    }).as('loginRequest');

    cy.intercept('GET', '**/api-backend/users/*', {
      statusCode: 200,
      body: {
        id: 'user-123',
        fullName: 'Lucas Teste',
        email: 'lucas@test.com',
        role: 'ADOPTER',
      },
    }).as('getUserRequest');

    cy.intercept('POST', '**/api-backend/users', {
      statusCode: 201,
      body: { id: 'user-123', email: 'novo@usuario.com' },
    }).as('registerRequest');
  });

  it('should redirect to login when trying to access private routes without being logged in', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    
    cy.visit('/perfil');
    cy.url().should('include', '/login');
  });

  it('should perform login successfully and redirect to dashboard', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('teste@cypress.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.wait('@getUserRequest');

    cy.url().should('include', '/dashboard');
    cy.contains(/Lucas!/).should('be.visible');

    // Verificar persistência
    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.eq(FAKE_TOKEN);
    });
    cy.getCookie('adotapet_token').should('have.property', 'value', FAKE_TOKEN);
  });

  it('should show error message on login failure', () => {
    cy.intercept('POST', '**/api-backend/auth/login', {
      statusCode: 401,
      body: { message: 'Credenciais inválidas' },
    }).as('loginFail');

    cy.visit('/login');
    cy.get('input[name="email"]').type('errado@test.com');
    cy.get('input[name="password"]').type('senha123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('Credenciais inválidas').should('be.visible');
  });

  it('should register a new user successfully', () => {
    cy.visit('/registro');

    cy.get('input[name="name"]').type('Novo Usuário');
    cy.get('input[name="email"]').type('novo@test.com');
    cy.get('input[name="password"]').type('Strong@Pass123');
    cy.get('input[name="confirmPassword"]').type('Strong@Pass123');
    cy.get('input[name="phone"]').type('35999999999');
    cy.get('input[name="city"]').type('Santa Rita');
    cy.get('select[name="state"]').select('MG');
    
    // Checkbox de termos (usando click no label pois o input pode estar estilizado/escondido)
    cy.contains('Concordo com os termos').click();

    cy.contains('button', /Criar conta/i).click();

    cy.wait('@registerRequest');
    
    // O registro redireciona para login após o alert
    cy.on('window:alert', (text) => {
      expect(text).to.contains('sucesso');
    });
    
    cy.url().should('include', '/login');
  });

  it('should perform logout and clean up session', () => {
    cy.login('adopter');
    cy.visit('/dashboard');

    // Verificar se o nome aparece no botão (garante que o login funcionou)
    cy.get('button[aria-label="Abrir menu do usuário"]').should('contain', 'Lucas').click();
    
    // Pequena pausa para animação do dropdown
    cy.wait(500);

    // Clicar no botão de sair
    cy.contains('Sair da conta').should('be.visible').click({ force: true });

    // Esperar a limpeza dos dados e o redirecionamento
    cy.wait(1000);

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.getCookie('adotapet_token').should('not.exist');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.equal(null);
    });
  });
});
