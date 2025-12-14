import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-compare',
  imports: [CommonModule],
  templateUrl: './file-compare.html',
  styleUrls: ['./file-compare.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileCompare {
  controlFileName = signal<string | null>(null);
  newFileName = signal<string | null>(null);
  controlContent = signal<string | null>(null);
  newContent = signal<string | null>(null);
  uniqueLines = signal<string[]>([]);
  computed = signal(false);

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  async onControlFileSelected(ev: Event): Promise<void> {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.controlFileName.set(file.name);
    const text = await this.readFileAsText(file);
    this.controlContent.set(text);
    this.computeUniqueLines();
  }

  async onNewFileSelected(ev: Event): Promise<void> {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.newFileName.set(file.name);
    const text = await this.readFileAsText(file);
    this.newContent.set(text);
    this.computeUniqueLines();
  }

  computeUniqueLines(): void {
    const control = this.controlContent() || '';
    const neu = this.newContent() || '';

    if (!neu) {
      this.uniqueLines.set([]);
      this.computed.set(false);
      return;
    }

    const controlSet = new Set(
      control
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '')
    );
    const seen = new Set<string>();
    const uniques: string[] = [];

    for (const raw of neu.split('\n')) {
      const line = raw.trim();
      if (line === '') continue;
      if (!controlSet.has(line) && !seen.has(line)) {
        uniques.push(line);
        seen.add(line);
      }
    }

    this.uniqueLines.set(uniques);
    this.computed.set(true);
  }

  downloadUniqueLines(): void {
    const lines = this.uniqueLines();
    if (!lines || lines.length === 0) return;
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = this.newFileName() || 'unique-lines.txt';

    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
