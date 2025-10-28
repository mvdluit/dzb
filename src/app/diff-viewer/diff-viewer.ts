import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

interface DiffPart {
  content: string;
  isAddition: boolean;
  oldContent: string;
  isChanged: boolean;
}

@Component({
  selector: 'app-diff-viewer',
  templateUrl: './diff-viewer.html',
  styleUrls: ['./diff-viewer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiffViewer {
  originalText = input.required<string>();
  updatedText = input.required<string>();

  diffParts = computed(() => {
    const original = this.originalText();
    const updated = this.updatedText();
    const parts: DiffPart[] = [];
    let currentIndex = 0;

    while (currentIndex < updated.length) {
      if (currentIndex < original.length && original[currentIndex] === updated[currentIndex]) {
        // Unchanged part
        const start = currentIndex;
        while (
          currentIndex < updated.length &&
          currentIndex < original.length &&
          original[currentIndex] === updated[currentIndex]
        ) {
          currentIndex++;
        }
        parts.push({
          content: updated.substring(start, currentIndex),
          isAddition: false,
          oldContent: original.substring(start, currentIndex),
          isChanged: false,
        });
      } else {
        // Added or different part
        const start = currentIndex;
        while (
          currentIndex < updated.length &&
          (currentIndex >= original.length || original[currentIndex] !== updated[currentIndex])
        ) {
          currentIndex++;
        }
        parts.push({
          content: updated.substring(start, currentIndex),
          isAddition: true,
          oldContent: original.substring(start, currentIndex),
          isChanged: true,
        });
      }
    }
    return parts;
  });
}
