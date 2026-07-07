import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAnalyse } from './client-analyse';

describe('ClientAnalyse', () => {
  let component: ClientAnalyse;
  let fixture: ComponentFixture<ClientAnalyse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientAnalyse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientAnalyse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
