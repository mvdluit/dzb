import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadSection } from './download-section';
describe('DownloadSection', () => {
  let fixture: ComponentFixture<DownloadSection>;
  let component: DownloadSection;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DownloadSection],
    });
    fixture = TestBed.createComponent(DownloadSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should accept processedContent input and reflect value', () => {
    fixture.componentRef.setInput('processedContent', 'test content');
    expect(component.processedContent()).toBe('test content');
  });

  it('should accept file size inputs and reflect values', () => {
    fixture.componentRef.setInput('originalFileSize', 123);
    fixture.componentRef.setInput('newFileSize', 456);
    expect(component.originalFileSize()).toBe(123);
    expect(component.newFileSize()).toBe(456);
  });
});
