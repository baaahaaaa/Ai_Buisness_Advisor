import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientAnalyseComponent } from './components/client-analyse/client-analyse.component';

export const routes: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'clients', component: ClientListComponent },
  { path: 'analyse/:id', component: ClientAnalyseComponent }
];