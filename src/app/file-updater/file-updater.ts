import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { FileProcessingService } from '../file-processing.service';
import { FileDiffViewer } from '../file-diff-viewer/file-diff-viewer';
import { FileUploadSection } from '../file-upload-section/file-upload-section';
import { SequenceConflictList } from '../sequence-conflict-list/sequence-conflict-list';
import { DownloadSection } from '../download-section/download-section';
import { ExcelUploadSection } from '../excel-upload-section/excel-upload-section';
import { LookupObject } from '../excel-processing.service';

interface UpdateInfo {
  originalLine: string;
  updatedLine: string;
}

interface SequenceConflict {
  id: string;
  sequences: string[];
}

@Component({
  selector: 'app-file-updater',
  imports: [
    CommonModule,
    FileDiffViewer,
    FileUploadSection,
    SequenceConflictList,
    DownloadSection,
    ExcelUploadSection,
  ],
  templateUrl: './file-updater.html',
  styleUrls: ['./file-updater.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUpdater {
  selectedFile = signal<File | null>(null);
  originalContent = signal<string | null>(null);
  processedContent = signal<string | null>(null);
  lookupData = signal<LookupObject[] | null>(null);
  updatedLinesInfo = signal<UpdateInfo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  newFileSize = signal<number | null>(null);
  originalFileSize = signal<number | null>(null);
  sequenceConflicts = signal<SequenceConflict[]>([]);
  blob: Blob | null = null;

  private fileProcessingService = inject(FileProcessingService) as FileProcessingService;

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.processedContent.set(null);
    this.updatedLinesInfo.set([]);
    this.error.set(null);
  }

  setLookupData(data: LookupObject[]): void {
    this.lookupData.set(data);
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

    if (!this.lookupData() || this.lookupData()!.length === 0) {
      this.error.set('No lookup data available from Excel file.');
      this.loading.set(false);
      return;
    }
    this.fileProcessingService
      .readFileAsObservable(file)
      .pipe(
        tap((text) => this.originalContent.set(text)),
        map((text) => {
          const lines = text.split('\n');
          const conflicts = this.fileProcessingService.findSequenceConflicts(lines);
          this.sequenceConflicts.set(conflicts);
          if (conflicts.length > 0) {
            return { processedText: text, updatedInfos: [] };
          }
          return this.fileProcessingService.updateSequenceNumbers(text, this.lookupData()!);
        }),
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
}
