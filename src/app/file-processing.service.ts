import { Injectable } from '@angular/core';
import { LookupEntry } from './data.service';
import { Observable } from 'rxjs';

export interface UpdateInfo {
  originalLine: string;
  updatedLine: string;
}

export interface SequenceConflict {
  id: string;
  sequences: string[];
}

@Injectable({ providedIn: 'root' })
export class FileProcessingService {
  readFileAsObservable(file: File): Observable<string> {
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
  findSequenceConflicts(lines: string[]): SequenceConflict[] {
    const sequencesByID = new Map<string, Set<string>>();
    for (const line of lines) {
      if (line.length < 19) continue;
      const id = line.substring(10, 15);
      const sequence = line.substring(16, 19).trim();
      if (sequence === '') continue;
      if (!sequencesByID.has(id)) {
        sequencesByID.set(id, new Set([sequence]));
      } else {
        sequencesByID.get(id)!.add(sequence);
      }
    }
    const conflicts: SequenceConflict[] = [];
    for (const [id, sequences] of sequencesByID) {
      if (sequences.size > 1) {
        conflicts.push({ id, sequences: Array.from(sequences) });
      }
    }
    return conflicts;
  }

  updateSequenceNumbers(
    text: string,
    lookupData: LookupEntry[]
  ): { processedText: string; updatedInfos: UpdateInfo[] } {
    const lines = text.split('\n');
    const updatedInfos: UpdateInfo[] = [];
    const updatedLines = lines.map((line) => {
      if (line.length < 18 || line.substring(16, 19).trim() === '') return line;
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
