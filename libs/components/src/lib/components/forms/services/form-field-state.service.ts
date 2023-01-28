import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FormFieldStateService {
  labelId$ = new BehaviorSubject<string | null>(null);
  inputId$ = new BehaviorSubject<string | null>(null);
}
