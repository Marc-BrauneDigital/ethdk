import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { DYNAMIC_FORM_FIELD_DIRECTIVE_PUBLIC_API } from '../../../../directives';
import { InputStateService } from '../../../../services';
import { DecoratedFormFieldBase } from '../../../../utils';
import { ErrorComponent } from '../../../error';

@Component({
  selector: 'et-select-field',
  template: `
    <ng-content select="et-label" />
    <div class="et-select-field-input">
      <ng-content select="et-native-select" />
    </div>
    <et-error [errors]="inputState.errors$ | async" />
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-form-field et-select-field',
  },
  hostDirectives: DYNAMIC_FORM_FIELD_DIRECTIVE_PUBLIC_API,
  imports: [ErrorComponent, NgIf, AsyncPipe],
})
export class SelectFieldComponent extends DecoratedFormFieldBase {
  protected readonly inputState = inject(InputStateService);
}
