import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LocalDate } from '@js-joda/core';
import { Workout } from '../../shared/bottom-nav/models/workout.model';
import { ExerciseService } from '../../shared/bottom-nav/services/exercise.service';
import { WorkoutService } from '../../shared/bottom-nav/services/workout.service';
import { FormsModule } from '@angular/forms';
import { LocalDateTimePipe } from '../../shared/bottom-nav/pipes/local-date-time-pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, LocalDateTimePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history.html'
})
export class History {
  protected workoutService = inject(WorkoutService);
  protected exerciseService = inject(ExerciseService);

  // Filter state
  protected searchTerm = signal('');
  protected fromDate = signal<string>('');  // ISO date strings from the date input
  protected toDate = signal<string>('');

  // Which workout (if any) is expanded
  protected expandedId = signal<string | null>(null);

  // Filtered list — recomputes whenever filters or workouts change
  protected filteredWorkouts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const from = this.fromDate() ? LocalDate.parse(this.fromDate()) : null;
    const to = this.toDate() ? LocalDate.parse(this.toDate()) : null;

    return this.workoutService.pastWorkouts().filter(w => {
      const date = w.startedAt.toLocalDate();
      if (from && date.isBefore(from)) return false;
      if (to && date.isAfter(to)) return false;

      if (term) {
        const exerciseNames = w.exercises
          .map(ex => this.exerciseService.getName(ex.exerciseId).toLowerCase());
        if (!exerciseNames.some(name => name.includes(term))) return false;
      }

      return true;
    });
  });

  protected toggleExpanded(id: string): void {
    this.expandedId.update(current => current === id ? null : id);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.fromDate.set('');
    this.toDate.set('');
  }

  protected totalSets(workout: Workout): number {
    return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  }
}