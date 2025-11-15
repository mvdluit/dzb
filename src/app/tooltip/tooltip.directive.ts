import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  input,
  ViewContainerRef,
} from '@angular/core';
import { Tooltip } from './tooltip';

export interface TooltipOptions {
  title?: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

@Directive({
  selector: '[tooltip]',
  host: {
    '(mouseenter)': 'showTooltip()',
    '(mouseleave)': 'hideTooltip()',
  },
})
export class TooltipDirective {
  tooltip = input.required<TooltipOptions>();
  private componentRef: ComponentRef<Tooltip> | null = null;
  private elementRef = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);

  showTooltip() {
    if (this.componentRef) {
      return;
    }

    this.componentRef = this.viewContainerRef.createComponent(Tooltip);

    this.componentRef.setInput('title', this.tooltip().title);
    this.componentRef.setInput('content', this.tooltip().content);

    this.positionComponent();

    this.componentRef.location.nativeElement.classList.add(`tooltip-${this.tooltip().position}`);
  }

  hideTooltip() {
    this.destroy();
  }

  private positionComponent(): void {
    if (!this.componentRef) {
      return;
    }

    const hostEl = this.elementRef.nativeElement as HTMLElement;
    const tooltipEl = this.componentRef.location.nativeElement as HTMLElement;

    const rect = hostEl.getBoundingClientRect();

    document.body.appendChild(tooltipEl);

    let newLeft = 0;
    let newTop = 0;

    switch (this.tooltip().position) {
      case 'top':
        newLeft = rect.left + rect.width / 2;
        newTop = rect.top + window.scrollY;
        break;
      case 'bottom':
        newLeft = rect.left + rect.width / 2;
        newTop = rect.bottom + window.scrollY;
        break;
      case 'left':
        newLeft = rect.left + window.scrollX;
        newTop = rect.top + rect.height / 2 + window.scrollY;
        break;
      case 'right':
        newLeft = rect.right + window.scrollX;
        newTop = rect.top + rect.height / 2 + window.scrollY;
        break;
    }

    tooltipEl.style.left = `${newLeft}px`;
    tooltipEl.style.top = `${newTop}px`;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
