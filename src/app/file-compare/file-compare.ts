import { Component } from '@angular/core';

@Component({
  selector: 'app-file-compare',
  imports: [],
  template: `
    <section class="container">
      <h2>File Compare</h2>
      <p>Compare two DPIA100 files and inspect differences (placeholder).</p>
    </section>
  `,
  styles: [
    `
      .container {
        padding: 2rem;
        text-align: center;
        color: var(--text-color);
      }
    `,
  ],
})
export class FileCompare {}
