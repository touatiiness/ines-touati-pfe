import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouveauMpComponent } from './nouveau-mp.component';

describe('NouveauMpComponent', () => {
  let component: NouveauMpComponent;
  let fixture: ComponentFixture<NouveauMpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NouveauMpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouveauMpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
