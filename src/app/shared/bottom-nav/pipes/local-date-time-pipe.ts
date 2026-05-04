import { Pipe, PipeTransform } from '@angular/core';
import { LocalDateTime, DateTimeFormatter } from '@js-joda/core';

@Pipe({ name: 'jodaDate', standalone: true })
export class LocalDateTimePipe implements PipeTransform {
  transform(value: LocalDateTime | null, pattern = 'MMM d, yyyy'): string {
    if (!value) return '';
    return value.format(DateTimeFormatter.ofPattern(pattern));
  }
}