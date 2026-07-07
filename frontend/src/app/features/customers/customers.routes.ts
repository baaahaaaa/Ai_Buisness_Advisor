import { Routes } from '@angular/router';
import { ClientListComponent } from './client-list.component';
import { ClientAnalyseComponent } from './client-analyse.component';

export const CUSTOMER_ROUTES: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'analyse/:id', component: ClientAnalyseComponent }
];
