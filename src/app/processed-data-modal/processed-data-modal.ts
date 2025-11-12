import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupObject } from '../excel-processing.service';

@Component({
  selector: 'app-processed-data-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content">
        <button class="close-button" (click)="closeModal()">X</button>
        <h3>Verwerkte IDs:</h3>
        @if(data && data.length > 0) {
        <p>{{ data.length }} dienstverbanden gevonden</p>
        <div class="data-scroll-area">
          <pre>{{ data | json }}</pre>
        </div>
        } @else {
        <p>Geen data beschikbaar om te tonen.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      max-width: 80%;
      max-height: 80%;
      overflow: hidden; /* For inner scroll area */
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.2em;
      cursor: pointer;
      color: #555;
    }

    .close-button:hover {
      color: #000;
    }

    .data-scroll-area {
      flex-grow: 1;
      overflow-y: auto;
      margin-top: 10px;
      border: 1px solid #eee;
      padding: 5px;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `,
})
export class ProcessedDataModalComponent {
  @Input() data: LookupObject[] | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
