import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { ParticipantComponent } from './pages/participant/participant.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'hunt/:code', component: ParticipantComponent },
  { path: 'hunt', component: ParticipantComponent },
  { path: '', redirectTo: '/hunt', pathMatch: 'full' }
];