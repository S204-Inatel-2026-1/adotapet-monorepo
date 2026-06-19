describe('ONG Pet Management - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');
  });

  it('should allow a ONG to register a new pet', () => {
    cy.visit('/painel/pets/novo');

    // Esperar a tela carregar
    cy.contains('Cadastrar novo pet', { timeout: 10000 }).should('be.visible');

    // Preencher informações básicas
    cy.get('input[name="name"]').type('Rex E2E Test');
    
    // Selecionar Espécie
    cy.get('select[name="species"]').select('DOG');
    
    // Selecionar Sexo 
    cy.contains('label', 'Macho').click();

    // Informações Adicionais
    cy.get('input[name="breed"]').type('Pastor Alemão');
    cy.get('input[name="ageInMonths"]').type('12');
    cy.get('select[name="size"]').select('LARGE');
    
    cy.get('textarea[name="description"]').type('Um cão muito leal e brincalhão, ideal para testes end-to-end.');

    // Localização
    cy.get('input[name="city"]').type('Santa Rita do Sapucaí');
    cy.get('select[name="state"]').select('MG');

    // Enviar formulário
    cy.get('button[type="submit"]').click();

    // Verificar redirecionamento ou mensagem de sucesso
    cy.url({ timeout: 10000 }).should('include', '/painel/pets');
  });

  it('should show validation errors if fields are missing', () => {
    cy.visit('/painel/pets/novo');
    
    // Tentar enviar sem preencher nada
    cy.get('button[type="submit"]').click();

    // Verificar se mensagens de erro aparecem (assumindo que o design usará labels ou spans de erro)
    cy.contains(/nome é obrigatório/i).should('be.visible');
    cy.contains(/espécie é obrigatória/i).should('be.visible');
  });
});
