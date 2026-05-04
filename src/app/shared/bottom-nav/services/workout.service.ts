import { computed, effect, Injectable, signal } from "@angular/core";
import { Workout, WorkoutSet } from "../models/workout.model";
import { ChronoUnit, LocalDate, LocalDateTime } from '@js-joda/core';
import { Exercise } from "../models/exercise.model";

const STORAGE_KEYS = {
  current: 'workout-log:current-workout',
  past: 'workout-log:past-workouts',
  currentExercise: 'workout-log:current-exercise-id',
} as const;

@Injectable({ providedIn: 'root' })

export class WorkoutService {
    readonly currentWorkout = signal<Workout | null>(this.loadCurrent());
    readonly pastWorkouts = signal<Workout[]>(this.loadPast());
    readonly currentExerciseId = signal<string | null>(null);
    
    readonly recentWorkouts = computed(() => this.pastWorkouts().slice(0, 5));
    readonly weeklyVolume = computed(() => {
        const oneWeekAgo = LocalDateTime.now().plusWeeks(-1);
        return this.pastWorkouts()
            .filter(w => w.startedAt.isAfter(oneWeekAgo))
            .flatMap(w => w.exercises)
            .flatMap(ex => ex.sets)
            .reduce((sum, set) => sum + set.weight * set.reps, 0);
        });

    readonly weeklyWorkoutCount = computed(() => {
        const oneWeekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        return this.pastWorkouts().filter(w => w.startedAt.isAfter(oneWeekAgo)).length;
    });

    readonly currentStreak = computed(() => {
        const completedDates = this.pastWorkouts()
            .filter(w => w.completedAt !== null)
            .map(w => w.completedAt!.toLocalDate())
            // Dedupe — multiple workouts on the same day count as one
            .reduce<LocalDate[]>((acc, date) => {
                if (!acc.some(d => d.equals(date))) acc.push(date);
                return acc;
            }, [])
            .sort((a, b) => b.compareTo(a));

        if (completedDates.length === 0) return 0;

        const today = LocalDate.now();
        let expected = today.equals(completedDates[0]) ? today : today.minusDays(1);
        let streak = 0;

        for (const date of completedDates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    });

    totalVolume(workout: Workout): number {
        return workout.exercises
            .flatMap(ex => ex.sets)
            .reduce((sum, set) => sum + set.weight * set.reps, 0);
    }

    constructor() {
        effect(() => {
            const w = this.currentWorkout();
            if (w) localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(w));
            else localStorage.removeItem(STORAGE_KEYS.current);
        });
        effect(() => {
            localStorage.setItem(STORAGE_KEYS.past, JSON.stringify(this.pastWorkouts()));
        });
    }

    startWorkout(exercise: Exercise) {
        this.currentWorkout.set({
            id: crypto.randomUUID(),
            startedAt: LocalDateTime.now(),
            completedAt: null,
            exercises: [{ exerciseId: exercise.id, sets: [] }],  // store id only
        });
    }

    addExercise(exercise: Exercise) {
        const current = this.currentWorkout();
        if (!current)
            return;

        this.currentWorkout.set({
            ...current,
            exercises: [...current.exercises, { exerciseId: exercise.id, sets: [] }]
        });
        this.switchToExercise(exercise.id); // focus the newly added exercise.
    }

    switchToExercise(exerciseId: string) {
        this.currentExerciseId.set(exerciseId);
    }
    
    logSet(set: { weight: number; reps: number }) {
        const current = this.currentWorkout();
        const exerciseId = this.currentExerciseId();
        if (!current || !exerciseId) return;

        const newSet: WorkoutSet = {
            weight: set.weight,
            reps: set.reps,
            completedAt: LocalDateTime.now(),
        };

        // update the current workouts exercise set.
        this.currentWorkout.set({
            ...current,
            exercises: current.exercises.map(e =>
                e.exerciseId === exerciseId
                    ? { ...e, sets: [...e.sets, newSet] }
                    : e
                ),
        });
    }

    finishWorkout() {
        const current = this.currentWorkout();
        if (!current)
            return;

        const completed: Workout = { ...current, completedAt: LocalDateTime.now() };
        this.pastWorkouts.update(past => [completed, ...past]); // put the most recent ones in the front of the list.
        this.clearCurrent();
    }

    // Remove the workout like it never existed since it was never finished.
    cancelWorkout() {
        this.clearCurrent();
    }

    private loadCurrent(): Workout | null {
        const raw = localStorage.getItem(STORAGE_KEYS.current);
        return raw ? this.parse(JSON.parse(raw)) : null;
    }

    private loadPast(): Workout[] {
        const raw = localStorage.getItem(STORAGE_KEYS.past);
        return raw ? (JSON.parse(raw) as any[]).map(w => this.parse(w)) : [];
    }

    // Convert ISO strings back to LocalDateTime after JSON.parse
    private parse(raw: any): Workout {
        return {
            ...raw,
            startedAt: LocalDateTime.parse(raw.startedAt),
            completedAt: raw.completedAt ? LocalDateTime.parse(raw.completedAt) : null,
            exercises: raw.exercises.map((ex: any) => ({
                ...ex,
                sets: ex.sets.map((s: any) => ({ ...s, completedAt: LocalDateTime.parse(s.completedAt) })),
            })),
        };
    }

    private clearCurrent(): void {
        this.currentWorkout.set(null);
        this.currentExerciseId.set(null);
    }
}