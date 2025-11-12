import { Injectable } from '@angular/core';
import * as XLSX from '@e965/xlsx';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface LookupObject {
  id: string;
  sequence: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelProcessingService {
  constructor() {}

  processExcelFile(file: File): Observable<LookupObject[]> {
    return this.readFileAsObservable(file).pipe(
      map((workbook: XLSX.WorkBook) => {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Excel file is empty or could not be read.');
        }

        const headerRow = jsonData[0];
        const dataRows = jsonData.slice(1);

        const idColumnIndex = headerRow.findIndex(
          (header) => typeof header === 'string' && header.toLowerCase().trim() === 'dvb'
        );

        if (idColumnIndex === -1) {
          throw new Error('Could not find a column named "dvb" in the Excel file.');
        }

        const idObjects: LookupObject[] = [];

        for (const row of dataRows) {
          const idCellValue = row[idColumnIndex];
          if (typeof idCellValue === 'string') {
            const processedIdObject = this.parseAndFormatId(idCellValue);
            if (
              processedIdObject &&
              this.hasNoLetters(processedIdObject.id) &&
              this.hasNoLetters(processedIdObject.sequence)
            ) {
              idObjects.push(processedIdObject);
            } else {
              console.warn(`Skipping malformed ID: '${idCellValue}'`);
            }
          } else {
            console.warn(
              `Skipping non-string ID value: '${idCellValue}' (type: ${typeof idCellValue}). Expected string.`
            );
          }
        }
        return idObjects;
      })
    );
  }

  private hasNoLetters(myString: string): boolean {
    const letterRegex = /[a-zA-Z]/;
    return !letterRegex.test(myString);
  }

  private readFileAsObservable(file: File): Observable<XLSX.WorkBook> {
    return new Observable((subscriber) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const arrayBuffer = e.target.result;
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          subscriber.next(workbook);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };
      reader.onerror = (error) => {
        subscriber.error(error);
      };
      reader.readAsArrayBuffer(file);

      return () => {
        reader.abort();
        console.log('File reading aborted.');
      };
    });
  }

  private parseAndFormatId(rawId: string): LookupObject | null {
    const parts = rawId.trim().split(' ');

    if (parts.length !== 2 || parts[0] === '-1') {
      return null;
    }

    const idPart = parts[0].padStart(5, '0');
    const sequencePart = parts[1].padStart(3, '0');

    return {
      id: idPart,
      sequence: sequencePart,
    };
  }
}
