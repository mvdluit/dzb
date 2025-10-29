import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { DataService, LookupEntry } from '../data.service';
import { DiffViewer } from '../diff-viewer/diff-viewer';

interface UpdateInfo {
  originalLine: string;
  updatedLine: string;
}

@Component({
  selector: 'app-file-updater',
  imports: [CommonModule, DiffViewer],
  templateUrl: './file-updater.html',
  styleUrls: ['./file-updater.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUpdater {
  selectedFile = signal<File | null>(null);
  processedContent = signal<string | null>(null);
  updatedLinesInfo = signal<UpdateInfo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  newFileSize = signal<number | null>(null);
  originalFileSize = signal<number | null>(null);
  blob: Blob | null = null;

  private dataService = inject(DataService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
      this.processedContent.set(null);
      this.updatedLinesInfo.set([]);
      this.error.set(null);
    }
  }

  processFile(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.processedContent.set(null);
    this.updatedLinesInfo.set([]);
    this.originalFileSize.set(file.size);

    this.dataService
      .getLookupData()
      .pipe(
        switchMap((lookupData) =>
          this.readFileAsObservable(file).pipe(
            map((text) => this.updateSequenceNumbers(text, lookupData))
          )
        ),
        tap(({ processedText, updatedInfos }) => {
          this.processedContent.set(processedText);
          this.updatedLinesInfo.set(updatedInfos);
          this.blob = new Blob([processedText || ''], { type: 'text/plain' });
          this.newFileSize.set(this.blob.size);
        }),
        catchError((err) => {
          console.error(err);
          this.error.set('Failed to process file. Please check the console for details.');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  downloadFile(): void {
    const file = this.selectedFile();
    if (!this.blob || !file) {
      return;
    }
    const url = window.URL.createObjectURL(this.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private readFileAsObservable(file: File): Observable<string> {
    return new Observable((subscriber) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        subscriber.next(text);
        subscriber.complete();
      };
      reader.onerror = (e) => {
        subscriber.error('Error reading file');
      };
      reader.readAsText(file);
    });
  }

  private updateSequenceNumbers(
    text: string,
    lookupData: LookupEntry[]
  ): { processedText: string; updatedInfos: UpdateInfo[] } {
    const lines = text.split('\n');
    const updatedInfos: UpdateInfo[] = [];
    const updatedLines = lines.map((line) => {
      if (line.length < 22 || line.substring(16, 19).trim() === '') return line;

      const idMatch = line.substring(10, 15);

      const lookupEntry = lookupData.find((entry) => entry.id === idMatch);

      if (lookupEntry) {
        const newSequence = lookupEntry.sequence.padEnd(3, ' ').substring(0, 3);
        const updatedLine = line.substring(0, 16) + newSequence + line.substring(19);
        if (line !== updatedLine) {
          updatedInfos.push({ originalLine: line, updatedLine });
        }
        return updatedLine;
      }
      return line;
    });

    return { processedText: updatedLines.join('\n'), updatedInfos };
  }
}
