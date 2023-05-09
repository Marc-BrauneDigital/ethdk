import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { AnimatedOverlayDirective } from '@ethlete/core';
import { BehaviorSubject } from 'rxjs';
import { InputDirective, NativeInputRefDirective } from '../../../../../../directives';
import { DecoratedInputBase } from '../../../../../../utils';
import { SelectBodyComponent } from '../../partials';

@Component({
  selector: 'et-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-select',
  },
  imports: [NgIf, NativeInputRefDirective, AsyncPipe],
  hostDirectives: [{ directive: InputDirective, inputs: ['autocomplete'] }, AnimatedOverlayDirective],
})
export class SelectComponent extends DecoratedInputBase {
  private readonly _animatedOverlay = inject(AnimatedOverlayDirective);

  @Input()
  get searchable(): boolean {
    return this._searchable$.value;
  }
  set searchable(value: BooleanInput) {
    this._searchable$.next(coerceBooleanProperty(value));
  }
  private _searchable$ = new BehaviorSubject(false);

  @ViewChild('selectBodyTpl')
  selectBodyTpl: TemplateRef<unknown> | null = null;

  constructor() {
    super();
    this._animatedOverlay.placement = 'bottom';
  }

  mountOrUnmountSelectBody() {
    if (!this._animatedOverlay.isMounted) {
      this._animatedOverlay.mount({ component: SelectBodyComponent });
    } else {
      this._animatedOverlay.unmount();
    }
  }
}
