import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  template: ` <div class="tooltip-container">
    <div class="tooltip-title">{{ title() }}</div>
    <div class="tooltip-content">{{ content() }}</div>
  </div>`,
  styles: [
    `
      :host {
        position: absolute;
        z-index: 100;
        background-color: #fff;
        border: 1px solid var(--light-gray);
        border-radius: 4px;
        padding: 8px 12px;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        pointer-events: none;

        &.tooltip-top {
          transform: translate(-50%, calc(-100% - 8px));
        }
        &.tooltip-bottom {
          transform: translate(-50%, 8px);
        }
        &.tooltip-left {
          transform: translate(calc(-100% - 8px), -50%);
        }
        &.tooltip-right {
          transform: translate(8px, -50%);
        }
      }

      .tooltip-title {
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1rem;
        margin-bottom: 4px;
      }

      .tooltip-content {
        color: var(--dark-gray);
        font-size: 0.75rem;
        white-space: pre-line;
      }
    `,
  ],
})
export class Tooltip {
  title = input.required<string>();
  content = input.required<string>();
}
