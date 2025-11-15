import { TooltipOptions } from '../tooltip/tooltip.directive';
import { Component, input, output } from '@angular/core';
import { HelpIcon } from '../help-icon/help-icon';

@Component({
  selector: 'app-file-upload-section',
  templateUrl: './file-upload-section.html',
  styleUrls: ['./file-upload-section.css'],
  imports: [HelpIcon],
})
export class FileUploadSection {
  loading = input(false);
  error = input<string | null>(null);
  selectedFile = input<File | null>(null);

  fileSelected = output<File>();
  processFile = output<void>();
  downloadFile = output<void>();
  tooltipOptions: TooltipOptions = {
    title: 'Compas DPIA100 export',
    content:
      '1. Selecteer een van de Compas export bestanden. \n2. klik op verwerk bestand. \n3. Ga naar de volgende stap om de aanpassingen te controleren en het aangepaste bestand te downloaden. \n\n Let op: deze stap dient na het downloaden herhaald te worden voor de andere regelingen (CAD/CA2/WSW).',
    position: 'right',
  };

  onFileInputChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files[0]) {
      this.fileSelected.emit(inputEl.files[0]);
    }
  }
}
