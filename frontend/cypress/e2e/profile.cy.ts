describe('User Profile - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Login simulado
    cy.login('adopter');

    // Interceptar a rota de update
    cy.intercept('PATCH', '**/users/user-123', {
      statusCode: 200,
      body: {
        id: 'user-123',
        fullName: 'Lucas Atualizado',
        email: 'lucas.novo@test.com',
        role: 'ADOPTER',
        phone: '35988887777',
        city: 'Pouso Alegre'
      }
    }).as('updateUser');
  });

  it('should update user profile information successfully', () => {
    cy.visit('/perfil');

    // Verificar se os dados iniciais estão lá
    cy.get('input[name="name"]').should('have.value', 'Lucas Teste');

    // Limpar e preencher novos dados
    cy.get('input[name="name"]').clear().type('Lucas Atualizado');
    cy.get('input[name="email"]').clear().type('lucas.novo@test.com');
    cy.get('input[name="phone"]').type('35988887777');
    cy.get('input[name="city"]').type('Pouso Alegre');

    // Salvar
    cy.contains('button', /Salvar alterações/i).click();

    // Esperar a chamada da API
    cy.wait('@updateUser');

    // Verificar feedback de sucesso
    cy.contains('Salvo com sucesso').should('be.visible');

    // Verificar se o nome no cabeçalho/perfil atualizou (Reflexo da atualização do Contexto)
    cy.contains('Lucas Atualizado').should('be.visible');
    
    // Recarregar a página para garantir que persistiu (simulado pelo nosso mock e contexto)
    cy.visit('/perfil');
    cy.get('input[name="name"]').should('have.value', 'Lucas Atualizado');
  });

  it('should show error message if update fails', () => {
    cy.intercept('PATCH', '**/users/user-123', {
      statusCode: 400,
      body: { message: 'Este e-mail já está em uso' }
    }).as('updateFail');

    cy.visit('/perfil');
    cy.get('input[name="email"]').clear().type('email.duplicado@test.com');
    cy.contains('button', /Salvar alterações/i).click();

    cy.wait('@updateFail');
    cy.contains('Este e-mail já está em uso').should('be.visible');
  });
});
