import { Component, input, output } from '@angular/core';
import { HelpIcon } from '../help-icon/help-icon';
import { TooltipOptions } from '../tooltip/tooltip.directive';

@Component({
  selector: 'app-download-section',
  templateUrl: './download-section.html',
  styleUrls: ['./download-section.css'],
  imports: [HelpIcon],
})
export class DownloadSection {
  processedContent = input<string | null>(null);
  originalFileSize = input<number | null>(null);
  newFileSize = input<number | null>(null);
  downloadFile = output<void>();
  tooltipOptions: TooltipOptions = {
    title: 'Actieve Youforce dienstverbanden',
    content:
      '1. Controleer de aangepaste regels. \n2. Check of de bestandsgrootte van het originele en aangepaste bestand gelijk zijn. \n3. Download het aangepaste bestand en sla het op in een map "aangepast". \n4. Ga terug naar de vorige stap om een export bestand voor een andere regeling te verwerken.',
    position: 'right',
  };
}
