import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DestroyService } from '@ethlete/core';
import { StaticFormGroupDirective } from '../../../../directives';
import { CheckboxGroupDirective } from '../../directives';

@Component({
  selector: 'et-checkbox-group',
  template: ` <ng-content select="et-checkbox-field" /> `,
  styleUrls: ['./checkbox-group.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-form-group et-checkbox-group',
  },
  providers: [DestroyService],
  hostDirectives: [CheckboxGroupDirective, StaticFormGroupDirective],
})
export class CheckboxGroupComponent {}
