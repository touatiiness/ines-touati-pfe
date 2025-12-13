import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCoursComponent } from './gestion-cours.component';

describe('GestionCoursComponent', () => {
  let component: GestionCoursComponent;
  let fixture: ComponentFixture<GestionCoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionCoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
