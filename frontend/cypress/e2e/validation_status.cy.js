describe("Validation Status Page", () => {
    beforeEach(() => {
        cy.visit("http://127.0.0.1:3000/frontend/index.html"); 
    });

    it("loads and displays validation errors", () => {
        cy.get(".accordion").should("exist");
        cy.get(".accordion-item").should("have.length.greaterThan", 0);
    });

    it("filters errors based on search", () => {
        cy.get("#searchInput").type("Address mismatch");
        cy.get(".accordion-item").should("contain.text", "Address mismatch");
    });

    it("checks if an accordion item expands", () => {
        cy.get(".accordion-button").first().click();
        cy.get(".accordion-collapse").first().should("have.class", "show");
    });
});
