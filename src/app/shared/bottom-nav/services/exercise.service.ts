import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { Exercise } from "../models/exercise.model";

const STORAGE_KEY = 'workout-log:custom-exercises';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  readonly builtInExercises = signal<Exercise[]>([
    { id: 'bench-press', name: 'Bench Press', category: 'strength' },
    { id: 'squat', name: 'Squat', category: 'strength' },
    { id: 'deadlift', name: 'Deadlift', category: 'strength' },
    // todo: more?
  ]);

  readonly customExercises = signal<Exercise[]>(this.load());
  readonly allExercises = computed(() => [...this.builtInExercises(), ...this.customExercises()]);

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customExercises()));
    });
  }

  private load(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  addCustom(name: string, category: Exercise['category']): void {
    this.customExercises.update(list => [...list, {
      id: crypto.randomUUID(), name, category,
    }]);
  }

  getName(id: string): string {
    return this.allExercises().find(e => e.id === id)?.name ?? 'Unknown';
  }
}