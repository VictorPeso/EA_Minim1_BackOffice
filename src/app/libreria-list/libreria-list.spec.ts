import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibreriaList } from './libreria-list';

describe('LibreriaList', () => {
  let component: LibreriaList;
  let fixture: ComponentFixture<LibreriaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibreriaList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibreriaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
