import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { WorkoutPage } from './pages/workout/workout';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'workout', component: WorkoutPage },
  { path: 'history', component: History },
];
                                              