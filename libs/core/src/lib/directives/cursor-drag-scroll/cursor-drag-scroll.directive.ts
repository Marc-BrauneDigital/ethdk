import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { combineLatest, fromEvent, Subject, take, takeUntil, tap } from 'rxjs';
import { ContentObserverService, ResizeObserverService } from '../../services';
import { elementCanScroll } from '../../utils';
import { DestroyDirective } from '../destroy';
import { CURSOR_DRAG_SCROLLING_CLASS, CURSOR_DRAG_SCROLLING_PREPARED_CLASS } from './cursor-drag-scroll.constants';

@Directive({
  selector: '[etCursorDragScroll]',
  exportAs: 'etCursorDragScroll',
  standalone: true,
  hostDirectives: [DestroyDirective],
})
export class CursorDragScrollDirective implements AfterViewInit {
  private readonly _destroy$ = inject(DestroyDirective).destroy$;
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _contentObserverService = inject(ContentObserverService);
  private readonly _resizeObserverService = inject(ResizeObserverService);

  private readonly _bufferUntilScroll = 5;
  private readonly _mouseUp$ = new Subject<boolean>();

  private _isScrolling = false;
  private _canScroll = false;

  private _currentScrollState = {
    top: 0,
    left: 0,
    x: 0,
    y: 0,
  };

  ngAfterViewInit(): void {
    combineLatest([
      this._contentObserverService.observe(this._elementRef.nativeElement),
      this._resizeObserverService.observe(this._elementRef.nativeElement),
    ])
      .pipe(
        tap(() => this._updateCanScrollState()),
        takeUntil(this._destroy$),
      )
      .subscribe();

    fromEvent<MouseEvent>(this._elementRef.nativeElement, 'mousedown')
      .pipe(
        tap((e) => this._onMouseDown(e)),
        takeUntil(this._destroy$),
      )
      .subscribe();

    this._updateCanScrollState();
  }

  private _onMouseDown(e: MouseEvent) {
    if (!this._elementRef?.nativeElement || !this._canScroll) {
      return;
    }

    const element = this._elementRef.nativeElement;

    element.classList.add(CURSOR_DRAG_SCROLLING_PREPARED_CLASS);

    this._elementRef.nativeElement.style.scrollSnapType = 'none';
    this._elementRef.nativeElement.style.scrollBehavior = 'unset';

    this._currentScrollState = {
      left: this._elementRef.nativeElement.scrollLeft,
      top: this._elementRef.nativeElement.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        tap((e) => this._mouseMoveHandler(e)),
        takeUntil(this._mouseUp$),
        takeUntil(this._destroy$),
      )
      .subscribe();

    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(
        tap(() => this._mouseUpHandler()),
        take(1),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private _mouseMoveHandler(e: MouseEvent) {
    e.preventDefault();

    if (!this._elementRef?.nativeElement) {
      return;
    }

    const dx = e.clientX - this._currentScrollState.x;
    const dy = e.clientY - this._currentScrollState.y;

    if (Math.abs(dx) > this._bufferUntilScroll || Math.abs(dy) > this._bufferUntilScroll) {
      const element = this._elementRef.nativeElement;

      if (!this._isScrolling) {
        this._isScrolling = true;

        element.style.cursor = 'grabbing';
        element.classList.add(CURSOR_DRAG_SCROLLING_CLASS);
        element.scroll({
          top: this._currentScrollState.top - dy,
          left: this._currentScrollState.left - dx,
          behavior: 'smooth',
        });
      } else {
        element.scrollTop = this._currentScrollState.top - dy;
        element.scrollLeft = this._currentScrollState.left - dx;
      }
    }
  }

  private _mouseUpHandler() {
    this._mouseUp$.next(true);
    this._isScrolling = false;

    if (!this._elementRef?.nativeElement) {
      return;
    }

    this._elementRef.nativeElement.style.scrollSnapType = '';
    this._elementRef.nativeElement.style.scrollBehavior = '';

    this._elementRef.nativeElement.style.cursor = 'grab';
    this._elementRef.nativeElement.classList.remove(CURSOR_DRAG_SCROLLING_CLASS);
    this._elementRef.nativeElement.classList.remove(CURSOR_DRAG_SCROLLING_PREPARED_CLASS);
  }

  private _updateCanScrollState() {
    this._canScroll = elementCanScroll(this._elementRef.nativeElement);

    if (this._canScroll) {
      this._elementRef.nativeElement.style.cursor = 'grab';
    } else {
      this._elementRef.nativeElement.style.cursor = 'default';
    }
  }

  private _checkCanScroll() {
    if (this._elementRef.nativeElement.scrollWidth > this._elementRef.nativeElement.clientWidth) {
      return true;
    }
    if (this._elementRef.nativeElement.scrollHeight > this._elementRef.nativeElement.clientHeight) {
      return true;
    }

    return false;
  }
}
