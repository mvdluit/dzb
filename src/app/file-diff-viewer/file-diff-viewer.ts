import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNumber: number;
}

@Component({
  selector: 'app-file-diff-viewer',
  templateUrl: './file-diff-viewer.html',
  styleUrls: ['./file-diff-viewer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class FileDiffViewer {
  originalContent = input.required<string>();
  updatedContent = input.required<string>();

  diff = computed(() => {
    const originalLines = this.splitLines(this.originalContent());
    const updatedLines = this.splitLines(this.updatedContent());
    return this.calculateDiff(originalLines, updatedLines);
  });

  diffInterleaved = computed(() => {
    const flat = this.diff();
    return this.interleaveDiff(flat);
  });

  private splitLines(text: string): string[] {
    const parts = text.split('\n');
    if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
    return parts;
  }

  private interleaveDiff(flat: DiffLine[]): DiffLine[] {
    const out: DiffLine[] = [];
    let i = 0;
    while (i < flat.length) {
      const cur = flat[i];
      if (cur.type === 'removed') {
        const removedBlock: DiffLine[] = [];
        while (i < flat.length && flat[i].type === 'removed') {
          removedBlock.push(flat[i]);
          i++;
        }
        const addedBlock: DiffLine[] = [];
        let j = i;
        while (j < flat.length && flat[j].type === 'added') {
          addedBlock.push(flat[j]);
          j++;
        }
        const pairCount = Math.max(removedBlock.length, addedBlock.length);
        for (let k = 0; k < pairCount; k++) {
          if (k < removedBlock.length) out.push(removedBlock[k]);
          else out.push({ type: 'removed', text: '', lineNumber: -1 });

          if (k < addedBlock.length) out.push(addedBlock[k]);
          else out.push({ type: 'added', text: '', lineNumber: -1 });
        }

        i = j;
      } else {
        out.push(cur);
        i++;
      }
    }
    return out;
  }

  private calculateDiff(originalLines: string[], updatedLines: string[]): DiffLine[] {
    const originalLen = originalLines.length;
    const updatedLen = updatedLines.length;
    const lcsMatrix = Array(originalLen + 1)
      .fill(null)
      .map(() => Array(updatedLen + 1).fill(0));

    for (let i = 1; i <= originalLen; i++) {
      for (let j = 1; j <= updatedLen; j++) {
        if (originalLines[i - 1] === updatedLines[j - 1]) {
          lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
        } else {
          lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
        }
      }
    }

    const diffLines: DiffLine[] = [];
    let i = originalLen;
    let j = updatedLen;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === updatedLines[j - 1]) {
        diffLines.unshift({ type: 'unchanged', text: originalLines[i - 1], lineNumber: i });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
        diffLines.unshift({ type: 'added', text: updatedLines[j - 1], lineNumber: j });
        j--;
      } else if (i > 0 && (j === 0 || lcsMatrix[i][j - 1] < lcsMatrix[i - 1][j])) {
        diffLines.unshift({ type: 'removed', text: originalLines[i - 1], lineNumber: i });
        i--;
      } else {
        if (j > 0) {
          diffLines.unshift({ type: 'added', text: updatedLines[j - 1], lineNumber: j });
          j--;
        } else if (i > 0) {
          diffLines.unshift({ type: 'removed', text: originalLines[i - 1], lineNumber: i });
          i--;
        } else {
          break;
        }
      }
    }
    return diffLines;
  }
}
