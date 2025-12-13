import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutfichierComponent } from './ajoutfichier.component';

describe('AjoutfichierComponent', () => {
  let component: AjoutfichierComponent;
  let fixture: ComponentFixture<AjoutfichierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutfichierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutfichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
