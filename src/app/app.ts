import { Component, signal } from '@angular/core';
import { FileUpdater } from './file-updater/file-updater';

@Component({
  selector: 'app-root',
  imports: [FileUpdater],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sequence-number-converter');
}
