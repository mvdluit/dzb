import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <section class="not-found">
      <h2>404 — Pagina niet gevonden</h2>
      <p>De opgevraagde pagina bestaat niet.</p>
    </section>
  `,
  styles: [
    `
      .not-found {
        padding: 2rem;
        text-align: center;
      }
    `,
  ],
})
export class NotFound {}
