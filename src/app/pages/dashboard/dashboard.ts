import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalDateTimePipe } from '../../shared/bottom-nav/pipes/local-date-time-pipe';
import { WorkoutService } from '../../shared/bottom-nav/services/workout.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LocalDateTimePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected workoutService = inject(WorkoutService);
}