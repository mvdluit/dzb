import { Component, input } from '@angular/core';

export interface SequenceConflict {
  id: string;
  sequences: string[];
}

@Component({
  selector: 'app-sequence-conflict-list',
  templateUrl: './sequence-conflict-list.html',
  styleUrls: ['./sequence-conflict-list.css'],
})
export class SequenceConflictList {
  conflicts = input<SequenceConflict[]>([]);
}
