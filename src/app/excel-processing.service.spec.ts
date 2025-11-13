import { TestBed } from '@angular/core/testing';
import { ExcelProcessingService, LookupObject } from './excel-processing.service';
import * as XLSX from '@e965/xlsx';
import { take } from 'rxjs/operators';

class MockFileReader {
  onload: (e: any) => void = () => {};
  onerror: (e: any) => void = () => {};
  result: ArrayBufferLike | null = null;
  error: any = null;

  readAsArrayBuffer(file: File) {
    console.log(`MockFileReader: Reading file: ${file.name}`);

    const workbook = XLSX.utils.book_new();
    let ws_data: any[][] = [];

    switch (file.name) {
      case 'valid.xlsx':
        ws_data = [
          ['Header1', 'Dvb', 'Header3'],
          ['Val1A', '123 1', 'Val1C'],
          ['Val2A', '45 2', 'Val2C'],
          ['Val3A', '67890 3', 'Val3C'],
          ['Val4A', 'abc def', 'Val4C'],
          ['Val5A', 123, 'Val5C'],
          ['Val6A', '', 'Val6C'],
        ];
        break;
      case 'valid2.xlsx':
        ws_data = [
          ['Header1', 'Dvb', 'Header3'],
          ['Val1A', '123 1', 'Val1C'],
          ['Val2A', '45 2', 'Val2C'],
          ['Val3A', '67890 3', 'Val3C'],
          ['Val4A', 'abc def', 'Val4C'],
        ];
        break;
      case 'valid3.xlsx':
        ws_data = [
          ['Header1', 'Dvb', 'Header3'],
          ['Val1A', '123 1', 'Val1C'],
          ['Val2A', '45 2', 'Val2C'],
          ['Val3A', '67890 3', 'Val3C'],
          ['Val5A', 123, 'Val5C'],
        ];
        break;
      case 'no-dvb-column.xlsx':
        ws_data = [
          ['Header1', 'UID', 'Header3'],
          ['Val1A', '123 1', 'Val1C'],
        ];
        break;
      case 'empty.xlsx':
        ws_data = [[]];
        break;
      case 'header-only.xlsx':
        ws_data = [['Header1', 'Dvb', 'Header3']];
        break;
      case 'error.xlsx':
        this.error = new DOMException('Mock FileReader error', 'AbortError');
        this.onerror({ target: this, error: this.error });
        return;
      default:
        console.warn(`MockFileReader: Unknown file name '${file.name}', providing empty workbook.`);
    }

    if (ws_data.length > 0) {
      const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    }

    try {
      const wbout_data: Uint8Array = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      let finalBuffer: ArrayBufferLike;
      if (wbout_data instanceof ArrayBuffer) {
        finalBuffer = wbout_data;
      } else if (wbout_data instanceof Uint8Array && wbout_data.buffer) {
        finalBuffer = wbout_data.buffer;
      } else if (wbout_data instanceof Uint8Array) {
        finalBuffer = wbout_data.slice().buffer;
      } else {
        throw new Error('XLSX.write did not return a recognizable binary type.');
      }

      this.result = finalBuffer;

      console.log(
        `MockFileReader: Successfully generated ArrayBuffer for ${file.name}, size: ${this.result.byteLength}`
      );
      this.onload({ target: this });
    } catch (e) {
      console.error(`MockFileReader: Error generating ArrayBuffer for ${file.name}:`, e);
      this.error = e;
      this.onerror({ target: this, error: e });
    }
  }

  abort() {
    console.log('MockFileReader: abort called.');
  }
}

describe('ExcelProcessingService', () => {
  let service: ExcelProcessingService;
  let fileReaderSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExcelProcessingService],
    });
    service = TestBed.inject(ExcelProcessingService);

    fileReaderSpy = spyOn(window as any, 'FileReader').and.returnValue(new MockFileReader());
  });

  it('should process a valid Excel file and return formatted IDs', (done) => {
    const mockFile = new File([], 'valid.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          expect(data.length).toBe(3);
          expect(data[0]).toEqual({ id: '00123', sequence: '001' });
          expect(data[1]).toEqual({ id: '00045', sequence: '002' });
          expect(data[2]).toEqual({ id: '67890', sequence: '003' });
          expect(fileReaderSpy).toHaveBeenCalled();
          done();
        },
        error: (err) => {
          fail('Should not have errored: ' + err.message);
          done();
        },
      });
  });

  it('should throw an error if the "dvb" column is not found', (done) => {
    const mockFile = new File([], 'no-dvb-column.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: () => {
          fail('Should have thrown an error for missing "id" column.');
          done();
        },
        error: (err) => {
          expect(err.message).toBe('Could not find a column named "dvb" in the Excel file.');
          done();
        },
      });
  });

  it('should throw an error for an empty Excel file', (done) => {
    const mockFile = new File([], 'empty.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: () => {
          fail('Should have thrown an error for an empty file.');
          done();
        },
        error: (err) => {
          expect(err.message).toBe('Excel file is empty or could not be read.');
          done();
        },
      });
  });

  it('should return an empty array if the file only has a header row', (done) => {
    const mockFile = new File([], 'header-only.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          expect(data).toEqual([]);
          done();
        },
        error: (err) => {
          fail('Should not have errored: ' + err.message);
          done();
        },
      });
  });

  it('should skip malformed string ID values and log warnings', (done) => {
    // Renamed for clarity
    const mockFile = new File([], 'valid2.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const consoleWarnSpy = spyOn(console, 'warn');

    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          expect(data.length).toBe(3);
          expect(consoleWarnSpy).toHaveBeenCalledWith("Skipping malformed ID: 'abc def'");
          done();
        },
        error: (err) => {
          fail('Should not have errored: ' + err.message);
          done();
        },
      });
  });

  it('should skip non-string ID values and log warnings', (done) => {
    const mockFile = new File([], 'valid3.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const consoleWarnSpy = spyOn(console, 'warn');

    service
      .processExcelFile(mockFile)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          expect(data.length).toBe(3);
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Skipping non-string ID value: '123' (type: number). Expected string."
          );
          done();
        },
        error: (err) => {
          fail('Should not have errored: ' + err.message);
          done();
        },
      });
  });

  describe('parseAndFormatId', () => {
    it('should correctly pad id to 5 digits and set sequence to 3 digits', () => {
      expect((service as any).parseAndFormatId('1 1')).toEqual({ id: '00001', sequence: '001' });
      expect((service as any).parseAndFormatId('12 2')).toEqual({ id: '00012', sequence: '002' });
      expect((service as any).parseAndFormatId('12345 3')).toEqual({
        id: '12345',
        sequence: '003',
      });
    });

    it('should return null for malformed IDs', () => {
      expect((service as any).parseAndFormatId('1')).toBeNull();
      expect((service as any).parseAndFormatId('1 2 3')).toBeNull();
      expect((service as any).parseAndFormatId('')).toBeNull();
      expect((service as any).parseAndFormatId('   ')).toBeNull();
      expect((service as any).parseAndFormatId('abc')).toBeNull();
    });
  });

  it('should call reader.abort() if unsubscribed early', () => {
    const mockFile = new File([], 'valid.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const readerInstance = new MockFileReader();
    fileReaderSpy.and.returnValue(readerInstance);
    const abortSpy = spyOn(readerInstance, 'abort');

    const subscription = service.processExcelFile(mockFile).subscribe();
    subscription.unsubscribe();

    expect(abortSpy).toHaveBeenCalled();
  });
});
