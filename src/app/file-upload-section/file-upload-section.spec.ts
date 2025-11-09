import { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FileUploadSection } from './file-upload-section';

describe('FileUploadSection', () => {
  let fixture: ComponentFixture<FileUploadSection>;
  let component: FileUploadSection;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadSection],
    });
    fixture = TestBed.createComponent(FileUploadSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit fileSelected when file is chosen', () => {
    const spy = jasmine.createSpy('fileSelected');
    component.fileSelected.subscribe(spy);
    const event = { target: { files: [new File(['test'], 'test.txt')] } } as any;
    component.onFileInputChange(event);
    expect(spy).toHaveBeenCalledWith(jasmine.any(File));
  });

  it('should not emit fileSelected if no file is chosen', () => {
    const spy = jasmine.createSpy('fileSelected');
    component.fileSelected.subscribe(spy);
    const event = { target: { files: [] } } as any;
    component.onFileInputChange(event);
    expect(spy).not.toHaveBeenCalled();
  });
});
