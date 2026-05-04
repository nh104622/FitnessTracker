import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WorkoutService } from '../../shared/bottom-nav/services/workout.service';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ExerciseService } from '../../shared/bottom-nav/services/exercise.service';
import { Exercise } from '../../shared/bottom-nav/models/exercise.model';
import { ChronoUnit, LocalDateTime } from '@js-joda/core';
import { interval, startWith, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout.html',
  styleUrl: './workout.css',
})
export class WorkoutPage {
  protected workoutService = inject(WorkoutService);
  protected exerciseService = inject(ExerciseService);
  private fb = inject(FormBuilder);

  // Local UI state — toggles the inline picker for adding more exercises mid-workout
  protected showPicker = signal(false);

  // The form for logging a single set
  protected setForm = this.fb.group({
    weight: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    reps: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  // Convenience accessor — the page reads this often
  protected isActive = computed(() => this.workoutService.currentWorkout() !== null);

  protected pickExercise(exercise: Exercise): void {
    if (!this.isActive()) {
      this.workoutService.startWorkout(exercise);
    } else {
      this.workoutService.addExercise(exercise);
      this.showPicker.set(false);
    }
  }

  protected switchTo(exerciseId: string): void {
    this.workoutService.switchToExercise(exerciseId);
  }

  protected logSet(): void {
    const { weight, reps } = this.setForm.getRawValue();
    this.workoutService.logSet({ weight: weight!, reps: reps! });
    this.setForm.reset();
  }

  protected finishWorkout(): void {
    if (confirm('Finish this workout?')) {
      this.workoutService.finishWorkout();
    }
  }

  // Elapsed time as a formatted string, recomputes when tick or workout changes
  protected elapsed = computed(() => {
    const workout = this.workoutService.currentWorkout();
    if (!workout) return '00:00';

    const totalSeconds = workout.startedAt.until(this.tick(), ChronoUnit.SECONDS);
    return this.formatElapsed(totalSeconds);
  });

  // Tick every second; emits the current workout elapsed time.
  // this signal is automatically subscribed/unsubscibed to interval() without having to worry about it.
  private tick = toSignal(
    interval(1000).pipe(
      startWith(0),
      map(() => LocalDateTime.now())
    ),
    { initialValue: LocalDateTime.now() }
  );

  private formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
}
