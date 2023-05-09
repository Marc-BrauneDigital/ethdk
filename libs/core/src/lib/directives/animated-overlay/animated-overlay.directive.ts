import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import {
  ComponentRef,
  Directive,
  ElementRef,
  Injector,
  Input,
  NgZone,
  StaticProvider,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Instance as PopperInstance, Placement as PopperPlacement, createPopper } from '@popperjs/core';
import { Options as ArrowOptions } from '@popperjs/core/lib/modifiers/arrow';
import { Options as OffsetOptions } from '@popperjs/core/lib/modifiers/offset';
import { Subject, filter, take, takeUntil, tap } from 'rxjs';
import { createDestroy, nextFrame } from '../../utils';
import { AnimatedLifecycleDirective } from '../animated-lifecycle';

@Directive({
  standalone: true,
})
export class AnimatedOverlayDirective<
  T extends { _animatedLifecycle?: AnimatedLifecycleDirective; _markForCheck?: () => void },
> {
  private readonly _destroy$ = createDestroy();
  private readonly _overlayService = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _zone = inject(NgZone);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private _portal: ComponentPortal<T> | null = null;
  private _overlayRef: OverlayRef | null = null;
  private _componentRef: ComponentRef<T> | null = null;
  private _popper: PopperInstance | null = null;

  private _beforeOpened: Subject<void> | null = null;
  private _afterOpened: Subject<void> | null = null;
  private _beforeClosed: Subject<void> | null = null;
  private _afterClosed: Subject<void> | null = null;

  /**
   * The placement of the tooltip.
   * @default 'auto'
   */
  @Input()
  placement: PopperPlacement = 'auto';

  /**
   * The offset of the tooltip.
   * @see https://popper.js.org/docs/v2/modifiers/offset/#offset-1
   */
  @Input()
  offset: OffsetOptions['offset'] | Readonly<OffsetOptions['offset']> | null = null;

  /**
   * The arrow padding.
   * @see https://popper.js.org/docs/v2/modifiers/arrow/#padding
   * @default 4
   */
  @Input()
  arrowPadding: ArrowOptions['padding'] | null = null;

  get isMounted() {
    return !!this._componentRef;
  }

  get portal() {
    return this._portal;
  }

  get overlayRef() {
    return this._overlayRef;
  }

  get componentRef() {
    return this._componentRef;
  }

  get popper() {
    return this._popper;
  }

  mount(config: { component: ComponentType<T>; providers?: StaticProvider[]; data?: Partial<T> }) {
    const { component, providers, data } = config;

    this._beforeOpened?.next();

    const injector = Injector.create({
      parent: this._injector,
      providers: providers ?? [],
    });

    this._overlayRef = this._overlayService.create();

    this._portal = this._portal ?? new ComponentPortal(component, this._viewContainerRef, injector);
    this._componentRef = this._overlayRef.attach(this._portal);

    if (data) {
      Object.assign(this._componentRef.instance, data);
    }

    this._componentRef.instance._markForCheck?.();

    this._zone.runOutsideAngular(() => {
      if (!this._componentRef) {
        return;
      }
      this._popper = createPopper(this._elementRef.nativeElement, this._componentRef.location.nativeElement, {
        placement: this.placement,
        modifiers: [
          ...(this.offset
            ? [
                {
                  name: 'offset',
                  options: {
                    offset: this.offset,
                  },
                },
              ]
            : []),
          ...(this.arrowPadding
            ? [
                {
                  name: 'arrow',
                  options: {
                    padding: this.arrowPadding,
                  },
                },
              ]
            : []),
        ],
      });

      // We need to wait for the tooltip content to be rendered
      nextFrame(() => {
        if (!this._componentRef) {
          return;
        }

        this._popper?.update();
        this._componentRef.instance._animatedLifecycle?.enter();

        this._componentRef.instance._animatedLifecycle?.state$
          .pipe(
            tap((s) => {
              if (s === 'entered') {
                this._afterOpened?.next();
              }
            }),
            take(1),
            takeUntil(this._destroy$),
          )
          .subscribe();
      });
    });
  }

  unmount() {
    if (!this._componentRef) {
      return;
    }

    this._beforeClosed?.next();

    this._componentRef.instance._animatedLifecycle?.leave();

    this._componentRef.instance._animatedLifecycle?.state$
      .pipe(
        filter((s) => s === 'left'),
        take(1),
      )
      .subscribe(() => this._destroy());
  }

  beforeOpened() {
    if (!this._beforeOpened) {
      this._beforeOpened = new Subject();
    }

    return this._beforeOpened;
  }

  afterOpened() {
    if (!this._afterOpened) {
      this._afterOpened = new Subject();
    }

    return this._afterOpened;
  }

  beforeClosed() {
    if (!this._beforeClosed) {
      this._beforeClosed = new Subject();
    }

    return this._beforeClosed;
  }

  afterClosed() {
    if (!this._afterClosed) {
      this._afterClosed = new Subject();
    }

    return this._afterClosed;
  }

  _destroy() {
    this._zone.runOutsideAngular(() => {
      this._popper?.destroy();
      this._popper = null;
    });

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    if (this._componentRef) {
      this._componentRef.destroy();
      this._componentRef = null;
    }

    this._afterClosed?.next();
  }
}
