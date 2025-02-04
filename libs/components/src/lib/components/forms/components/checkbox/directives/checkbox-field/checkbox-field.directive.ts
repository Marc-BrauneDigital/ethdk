import { AfterContentInit, ContentChildren, Directive, forwardRef, inject, InjectionToken } from '@angular/core';
import { createReactiveBindings, DestroyService, TypedQueryList } from '@ethlete/core';
import { combineLatest, map, startWith, switchMap } from 'rxjs';
import { InputStateService } from '../../../../services';
import { CheckboxDirective, CHECKBOX_TOKEN } from '../public-api';

export const CHECKBOX_FIELD_TOKEN = new InjectionToken<CheckboxFieldDirective>('ET_CHECKBOX_FIELD_DIRECTIVE_TOKEN');

@Directive({
  standalone: true,
  providers: [{ provide: CHECKBOX_FIELD_TOKEN, useExisting: CheckboxFieldDirective }, DestroyService],
  exportAs: 'etCheckboxGroup',
})
export class CheckboxFieldDirective implements AfterContentInit {
  readonly inputState = inject<InputStateService<boolean>>(InputStateService);

  readonly _bindings = createReactiveBindings();

  @ContentChildren(forwardRef(() => CHECKBOX_TOKEN), { descendants: true })
  private _checkbox?: TypedQueryList<CheckboxDirective>;

  ngAfterContentInit(): void {
    if (!this._checkbox) {
      return;
    }

    this._bindings.push({
      attribute: 'class.et-checkbox-field--indeterminate',
      observable: this._checkbox.changes.pipe(startWith(this._checkbox)).pipe(
        switchMap((checkboxes) => combineLatest(checkboxes.map((checkbox) => checkbox.indeterminate$))),
        map((checked) => checked.some((value) => value)),
      ),
    });
  }
}
