import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-download-section',
  templateUrl: './download-section.html',
  styleUrls: ['./download-section.css'],
})
export class DownloadSection {
  processedContent = input<string | null>(null);
  originalFileSize = input<number | null>(null);
  newFileSize = input<number | null>(null);
  downloadFile = output<void>();
}
