import { FileProcessingService, SequenceConflict, UpdateInfo } from './file-processing.service';
import { LookupEntry } from './data.service';
import { TestBed } from '@angular/core/testing';

describe('FileProcessingService', () => {
  let service: FileProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FileProcessingService] });
    service = TestBed.inject(FileProcessingService);
  });

  it('should detect no conflicts in unique sequence lines', () => {
    const lines = ['CPSP00372003559 001', 'CPSP00372005543 002', 'CPSP00372006170 004'];
    expect(service.findSequenceConflicts(lines)).toEqual([]);
  });

  it('should detect conflicts for same ID with multiple sequences', () => {
    const lines = ['CPSP00372003559 001', 'CPSP00372003559 002', 'CPSP00372003559 003'];
    const conflicts = service.findSequenceConflicts(lines);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].id).toBe('03559');
    expect(conflicts[0].sequences).toEqual(['001', '002', '003']);
  });

  it('should ignore lines with missing sequence', () => {
    const lines = ['CPSP01106006069', 'CPSP01107006069', 'CPSP01134006069 001'];
    expect(service.findSequenceConflicts(lines)).toEqual([]);
  });

  it('should update sequence numbers based on lookup data', () => {
    const text = 'CPSP00372003559 001\nCPSP00372003559 002';
    const lookupData: LookupEntry[] = [{ id: '03559', sequence: '999' }];
    const result = service.updateSequenceNumbers(text, lookupData);
    expect(result.processedText).toContain('03559 999');
    expect(result.updatedInfos.length).toBe(2);
  });

  it('should not update lines if no matching lookup entry', () => {
    const text = 'CPSP00372003559 001';
    const lookupData: LookupEntry[] = [{ id: 'XXXXX', sequence: '999' }];
    const result = service.updateSequenceNumbers(text, lookupData);
    expect(result.processedText).toContain('03559 001');
    expect(result.updatedInfos.length).toBe(0);
  });

  it('should handle sample data without errors', () => {
    const sample = `CPSP00372003559 001\nCPSP00199003559 001\nCPSP02508003559 001\nCPSP00372005543 002`;
    const lookupData: LookupEntry[] = [
      { id: '03559', sequence: '123' },
      { id: '05543', sequence: '456' },
    ];
    const result = service.updateSequenceNumbers(sample, lookupData);
    expect(result.processedText).toContain('03559 123');
    expect(result.processedText).toContain('05543 456');
  });
});
