describe('ONG Pet Management - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');

    // 2. Mock do POST de criação
    cy.intercept('POST', '**/pets', {
      statusCode: 201,
      body: {
        id: 'new-pet-123',
        name: 'Rex',
        species: 'DOG'
      }
    }).as('createPet');
  });

  it('should allow a ONG to register a new pet', () => {
    cy.visit('/painel/pets/novo');

    // Preencher informações básicas
    cy.get('input[name="name"]').type('Rex');
    
    // Selecionar Espécie (pode ser rádio ou select, vamos testar select aqui)
    cy.get('select[name="species"]').select('DOG');
    
    // Selecionar Sexo
    cy.get('input[name="sex"][value="MALE"]').check({ force: true });

    // Informações Adicionais
    cy.get('input[name="breed"]').type('Pastor Alemão');
    cy.get('input[name="ageInMonths"]').type('12');
    cy.get('select[name="size"]').select('LARGE');
    
    cy.get('textarea[name="description"]').type('Um cão muito leal e brincalhão, ideal para casas com quintal.');

    // Localização
    cy.get('input[name="city"]').type('Santa Rita do Sapucaí');
    cy.get('select[name="state"]').select('MG');

    // Características (Checkboxes)
    cy.get('input[name="vaccinated"]').check();
    cy.get('input[name="neutered"]').check();

    // Enviar formulário
    cy.get('button[type="submit"]').click();

    // Verificar se a chamada da API foi feita com os dados corretos
    cy.wait('@createPet').then((interception) => {
      const body = interception.request.body;
      expect(body.name).to.equal('Rex');
      expect(body.species).to.equal('DOG');
      expect(body.sex).to.equal('MALE');
      expect(body.ageInMonths).to.equal(12);
    });

    // Verificar redirecionamento ou mensagem de sucesso
    cy.contains(/Pet cadastrado com sucesso/i).should('be.visible');
    cy.url().should('include', '/painel/pets');
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
