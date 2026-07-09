import { Routes } from '@angular/router';
import { ClientListComponent } from './client-list.component';
import { ClientAnalyseComponent } from './client-analyse.component';
import { ClientCreateComponent } from './client-create.component';

export const CUSTOMER_ROUTES: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'nouveau', component: ClientCreateComponent },
  { path: 'analyse/:id', component: ClientAnalyseComponent }
];