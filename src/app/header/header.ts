import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  template: `
    <header class="site-header">
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >Bestanden updaten</a
        >
        <a routerLink="/file-compare" routerLinkActive="active">Bestanden vergelijken</a>
      </nav>
    </header>
  `,
  styles: [
    `
      .site-header {
        background: var(--background-color);
        color: white;
        padding: 0.5rem 1rem;
        font-family: var(--font-family);
      }
      nav {
        display: flex;
        gap: 1rem;
      }
      a {
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
      a.active {
        text-decoration: underline;
      }
    `,
  ],
})
export class Header {}
