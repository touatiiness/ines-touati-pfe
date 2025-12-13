import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenitailiserMpComponent } from './renitailiser-mp.component';

describe('RenitailiserMpComponent', () => {
  let component: RenitailiserMpComponent;
  let fixture: ComponentFixture<RenitailiserMpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenitailiserMpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenitailiserMpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
