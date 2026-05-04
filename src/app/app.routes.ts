import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { WorkoutPage } from './pages/workout/workout';
import { History } from './pages/history/history';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'workout', component: WorkoutPage },
  { path: 'history', component: History },
];