import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-file-upload-section',
  templateUrl: './file-upload-section.html',
  styleUrls: ['./file-upload-section.css'],
})
export class FileUploadSection {
  loading = input(false);
  error = input<string | null>(null);
  selectedFile = input<File | null>(null);

  fileSelected = output<File>();
  processFile = output<void>();
  downloadFile = output<void>();

  onFileInputChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files[0]) {
      this.fileSelected.emit(inputEl.files[0]);
    }
  }
}
