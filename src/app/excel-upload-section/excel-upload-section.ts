import { CommonModule } from '@angular/common';
import { Component, output, signal, effect } from '@angular/core';
import { ExcelProcessingService, LookupObject } from '../excel-processing.service';
import { ProcessedDataModalComponent } from '../processed-data-modal/processed-data-modal';

@Component({
  selector: 'app-excel-upload-section',
  templateUrl: './excel-upload-section.html',
  styleUrls: ['./excel-upload-section.css'],
  imports: [CommonModule, ProcessedDataModalComponent],
})
export class ExcelUploadSection {
  selectedFile = signal<File | null>(null);
  processedExcelData = signal<LookupObject[]>([]);
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  showModal = signal<boolean>(false);
  lookupData = output<LookupObject[]>();

  constructor(private excelProcessingService: ExcelProcessingService) {
    effect(() => {
      const processedData = this.processedExcelData();
      if (processedData.length > 0) {
        this.lookupData.emit(processedData);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.processedExcelData.set([]);
      this.error.set(null);
    } else {
      this.selectedFile.set(null);
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('No file selected.');
      return;
    }

    this.error.set(null);
    this.processedExcelData.set([]);
    this.isLoading.set(true);

    this.excelProcessingService.processExcelFile(file).subscribe({
      next: (data) => {
        this.processedExcelData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'An unknown error occurred during file processing.');
        this.isLoading.set(false);
        console.error('File processing error:', err);
      },
    });
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}
