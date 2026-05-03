import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { Exercise } from "../models/exercise.model";
import { StorageService } from "./storage.service";

@Injectable({ providedIn: 'root' })

export class ExerciseService {
  private storage = inject(StorageService);

  readonly builtInExercises = signal<Exercise[]>([
    { id: 'bench-press', name: 'Bench Press', category: 'strength' },
    { id: 'squat', name: 'Squat', category: 'strength' },
    { id: 'deadlift', name: 'Deadlift', category: 'strength' },
    // todo: more?
  ]);

  readonly customExercises = signal<Exercise[]>(
    this.storage.get<Exercise[]>('workout-log:custom-exercises') ?? []
  );

  readonly allExercises = computed(() => [
    ...this.builtInExercises(),
    ...this.customExercises(),
  ]);

  constructor() {
    effect(() => {
      this.storage.set('workout-log:custom-exercises', this.customExercises());
    });
  }

  getName(id: string): string {
    return this.allExercises().find(e => e.id === id)?.name ?? 'Unknown';
  }

  addCustom(name: string, category: Exercise['category']): void {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name,
      category,
    };
    this.customExercises.update(current => [...current, newExercise]);
  }
}