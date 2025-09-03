describe("Homepage",()=>{
  it("loads the homepage",()=>{ cy.visit("/"); cy.contains("Blog Posts"); });
});