import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutSeanceComponent } from './ajout-seance.component';

describe('AjoutSeanceComponent', () => {
  let component: AjoutSeanceComponent;
  let fixture: ComponentFixture<AjoutSeanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutSeanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutSeanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
