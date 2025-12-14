import { TestBed } from '@angular/core/testing';
import { FileCompare } from './file-compare';

describe('FileCompare', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileCompare] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FileCompare);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('computes unique lines correctly', () => {
    const fixture = TestBed.createComponent(FileCompare);
    const comp = fixture.componentInstance;

    comp.controlContent.set('a\nb\nc');
    comp.newContent.set('b\nc\nd\n e\n');
    comp.computeUniqueLines();

    expect(comp.uniqueLines()).toEqual(['d', 'e']);
  });

  it('deduplicates duplicates in new file', () => {
    const fixture = TestBed.createComponent(FileCompare);
    const comp = fixture.componentInstance;

    comp.controlContent.set('');
    comp.newContent.set('x\nx\nx');
    comp.computeUniqueLines();

    expect(comp.uniqueLines()).toEqual(['x']);
  });

  it('downloadUniqueLines calls createObjectURL when there are lines', () => {
    const fixture = TestBed.createComponent(FileCompare);
    const comp = fixture.componentInstance;

    const spyCreate = spyOn(window.URL, 'createObjectURL').and.returnValue('blob://1');
    const clickSpy = jasmine.createSpy('click');
    const fakeAnchor: any = { click: clickSpy, href: '', download: '' };
    spyOn(document, 'createElement').and.returnValue(fakeAnchor as any);

    comp.uniqueLines.set(['one', 'two']);
    comp.newFileName.set('new.txt');
    comp.downloadUniqueLines();

    expect(spyCreate).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(fakeAnchor.download).toBe('new.txt');
  });
});
