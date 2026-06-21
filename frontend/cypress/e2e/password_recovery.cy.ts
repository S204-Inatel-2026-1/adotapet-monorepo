describe('Password Recovery Flow - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Intercepta a chamada de solicitação de recuperação de senha (Forgot Password)
    cy.intercept('POST', '**/api-backend/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Link enviado com sucesso' },
    }).as('forgotPasswordRequest');

    // Intercepta a chamada de redefinição de senha (Reset Password)
    cy.intercept('POST', '**/api-backend/auth/reset-password', {
      statusCode: 200,
      body: { success: true },
    }).as('resetPasswordRequest');
  });

  it('should navigate to forgot password page, request a reset link and then reset the password successfully', () => {
    // 1. Acessa a página de login
    cy.visit('/login');

    // 2. Clicar em "Esqueceu sua senha?"
    cy.contains('Esqueceu sua senha?').click();

    // Valida redirecionamento
    cy.url().should('include', '/esqueceu-senha');
    cy.contains('h1', 'Recuperar Senha').should('be.visible');

    // 3. Preenche o e-mail e envia
    cy.get('input[type="email"]')
      .type('usuario@teste.com')
      .should('have.value', 'usuario@teste.com');
    cy.contains('button', /Enviar Link de Recuperação/i).click();

    // Valida intercept da API
    cy.wait('@forgotPasswordRequest');

    // Valida mensagem de sucesso
    cy.contains('E-mail de recuperação enviado!').should('be.visible');
    cy.contains('Enviamos um link com as instruções').should('be.visible');

    // 4. Simula o clique do usuário no link do e-mail navegando para a rota de redefinição com token
    cy.visit('/recuperar-senha?token=token-seguro-jwt-123');

    // Valida formulário de redefinição
    cy.contains('h1', 'Criar Nova Senha').should('be.visible');

    // 5. Preenche a nova senha e confirmação
    cy.get('input[name="password"]').type('NovaSenhaForte123!');
    cy.get('input[name="confirmPassword"]').type('NovaSenhaForte123!');

    // Clica para salvar
    cy.contains('button', /Salvar Nova Senha/i).click();

    // Valida intercept de redefinição
    cy.wait('@resetPasswordRequest');

    // Valida tela de sucesso
    cy.contains('Senha alterada com sucesso!').should('be.visible');
    cy.contains('Sua senha foi redefinida e você já pode fazer login.').should('be.visible');

    // 6. Clicar em "Ir para Login" e validar redirecionamento
    cy.contains('a', 'Ir para Login').click();
    cy.url().should('include', '/login');
  });

  it('should show error screen if token parameter is missing on password reset route', () => {
    // Visita a rota sem o token na query string
    cy.visit('/recuperar-senha');

    // Deve exibir tela de erro
    cy.contains('Token de redefinição inválido ou expirado.').should('be.visible');
    cy.get('input[placeholder="Digite sua nova senha"]').should('not.exist');

    // Clicar em "Solicitar Novo Link" redireciona para a página de forgot
    cy.contains('a', 'Solicitar Novo Link').click();
    cy.url().should('include', '/esqueceu-senha');
  });
});
