import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  InjectionToken,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { ANIMATED_LIFECYCLE_TOKEN, AnimatedLifecycleDirective } from '@ethlete/core';
import { ProvideThemeDirective, THEME_PROVIDER } from '@ethlete/theming';
import { MENU_TRIGGER_TOKEN } from '../../directives';

export const MENU = new InjectionToken<MenuComponent>('ET_MENU');
export const MENU_TEMPLATE = new InjectionToken<TemplateRef<unknown>>('MENU_TEMPLATE');

@Component({
  selector: 'et-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-menu',
  },
  imports: [AnimatedLifecycleDirective, NgTemplateOutlet],
  hostDirectives: [ProvideThemeDirective],
  providers: [
    {
      provide: MENU,
      useExisting: MenuComponent,
    },
  ],
})
export class MenuComponent {
  @ViewChild(ANIMATED_LIFECYCLE_TOKEN, { static: true })
  readonly _animatedLifecycle?: AnimatedLifecycleDirective;

  private readonly _themeProvider = inject(THEME_PROVIDER);
  protected readonly injector = inject(Injector);
  private readonly _cdr = inject(ChangeDetectorRef);
  readonly _trigger = inject(MENU_TRIGGER_TOKEN);
  readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly _menuTemplate = inject(MENU_TEMPLATE);

  _markForCheck() {
    this._cdr.markForCheck();
  }

  _setThemeFromProvider(provider: ProvideThemeDirective) {
    this._themeProvider.syncWithProvider(provider);
  }
}
