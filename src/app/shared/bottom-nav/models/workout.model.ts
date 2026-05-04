import { LocalDateTime } from '@js-joda/core';

export interface Workout {
  id: string;
  startedAt: LocalDateTime;
  completedAt: LocalDateTime | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  completedAt: LocalDateTime;
}