import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SequenceConflictList } from './sequence-conflict-list';
import { signal } from '@angular/core';
describe('SequenceConflictList', () => {
  let fixture: ComponentFixture<SequenceConflictList>;
  let component: SequenceConflictList;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SequenceConflictList],
    });
    fixture = TestBed.createComponent(SequenceConflictList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should accept conflicts input and reflect value', () => {
    const conflicts = [
      { id: '00359', sequences: ['001', '002'] },
      { id: '05543', sequences: ['004', '005'] },
    ];
    fixture.componentRef.setInput('conflicts', conflicts);
    expect(component.conflicts()).toEqual(conflicts);
  });
});
