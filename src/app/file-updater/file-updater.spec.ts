import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { FileUpdater } from './file-updater';
import { FileProcessingService } from '../file-processing.service';
import { DataService } from '../data.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('FileUpdater', () => {
  let fixture: ComponentFixture<FileUpdater>;
  let component: FileUpdater;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileUpdater],
      providers: [
        FileProcessingService,
        {
          provide: DataService,
          useValue: {
            getLookupData: () => of([{ id: '03559', sequence: '999' }]),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(FileUpdater);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set selectedFile and reset signals on file select', () => {
    const testFile = new File(['test'], 'test.txt');
    component.onFileSelected(testFile);
    expect(component.selectedFile()).toBe(testFile);
    expect(component.processedContent()).toBeNull();
    expect(component.updatedLinesInfo().length).toBe(0);
    expect(component.error()).toBeNull();
  });

  it('should not process file if none selected', () => {
    component.selectedFile.set(null);
    component.processFile();
    expect(component.loading()).toBe(false);
  });

  it('should set error if file processing fails', () => {
    spyOn(component['dataService'], 'getLookupData').and.returnValue(
      throwError(() => new Error('Failed to process file. Please check the console for details'))
    );
    const testFile = new File(['test'], 'test.txt');
    component.selectedFile.set(testFile);
    component.processFile();
    expect(component.error()).toContain('Failed to process file');
  });

  it('should update processedContent and updatedLinesInfo on success', fakeAsync(() => {
    const initialFileContent = 'CPSP00372003559 001';
    const testFile = new File([initialFileContent], 'test.txt', { type: 'text/plain' });
    component.selectedFile.set(testFile);

    spyOn(component['fileProcessingService'], 'readFileAsObservable').and.returnValue(
      of(initialFileContent)
    );
    spyOn(component['fileProcessingService'], 'findSequenceConflicts').and.returnValue([]);

    component.processFile();

    tick();

    expect(component.processedContent()).toContain('03559 999');
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeNull();
  }));
});
