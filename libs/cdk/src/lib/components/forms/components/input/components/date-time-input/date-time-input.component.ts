import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { InputDirective, NativeInputRefDirective } from '../../../../directives';
import { DecoratedInputBase } from '../../../../utils';
import { DATE_TIME_INPUT_TOKEN, DateTimeInputDirective } from '../../directives';

@Component({
  selector: 'et-date-time-input',
  templateUrl: './date-time-input.component.html',
  styleUrls: ['./date-time-input.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-date-time-input',
  },
  imports: [AsyncPipe, NativeInputRefDirective],
  hostDirectives: [DateTimeInputDirective, { directive: InputDirective, inputs: ['autocomplete', 'placeholder'] }],
})
export class DateTimeInputComponent extends DecoratedInputBase {
  protected readonly dateInput = inject(DATE_TIME_INPUT_TOKEN);
}
