import { FocusOrigin } from '@angular/cdk/a11y';
import { merge, Observable, Subject, filter, take } from 'rxjs';
import { DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { DialogConfig } from './dialog-config';
import { DialogContainerBaseComponent } from './dialog-container-base.component';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import { DialogPosition } from './dialog.types';

export const enum DialogState {
  OPEN,
  CLOSING,
  CLOSED,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DialogRef<T = any, R = any> {
  componentInstance: T | null = null;
  disableClose: boolean | undefined;
  id: string;

  private readonly _afterOpened = new Subject<void>();
  private readonly _beforeClosed = new Subject<R | undefined>();

  private _result: R | undefined;
  private _closeFallbackTimeout: number | null = null;
  private _state = DialogState.OPEN;
  private _closeInteractionType: FocusOrigin | undefined;

  constructor(
    private _ref: CdkDialogRef<R, T>,
    config: DialogConfig,
    public _containerInstance: DialogContainerBaseComponent,
  ) {
    this.disableClose = config.disableClose;
    this.id = _ref.id;

    _containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'opened'),
        take(1),
      )
      .subscribe(() => {
        this._afterOpened.next();
        this._afterOpened.complete();
      });

    _containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'closed'),
        take(1),
      )
      .subscribe(() => {
        if (this._closeFallbackTimeout !== null) {
          clearTimeout(this._closeFallbackTimeout);
          this._closeFallbackTimeout = null;
        }

        this._finishDialogClose();
      });

    _ref.overlayRef.detachments().subscribe(() => {
      this._beforeClosed.next(this._result);
      this._beforeClosed.complete();
      this._finishDialogClose();
    });

    merge(
      this.backdropClick(),
      this.keydownEvents().pipe(
        filter((event) => event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)),
      ),
    ).subscribe((event) => {
      if (!this.disableClose) {
        event.preventDefault();
        this._closeDialogVia(this, event.type === 'keydown' ? 'keyboard' : 'mouse');
      }
    });
  }

  close(dialogResult?: R): void {
    this._result = dialogResult;

    this._containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'closing'),
        take(1),
      )
      .subscribe((event) => {
        this._beforeClosed.next(dialogResult);
        this._beforeClosed.complete();
        this._ref.overlayRef.detachBackdrop();
        this._closeFallbackTimeout = window.setTimeout(() => this._finishDialogClose(), event.totalTime + 100);
      });

    this._state = DialogState.CLOSING;
    this._containerInstance._startExitAnimation();
  }

  afterOpened(): Observable<void> {
    return this._afterOpened;
  }

  afterClosed(): Observable<R | undefined> {
    return this._ref.closed;
  }

  beforeClosed(): Observable<R | undefined> {
    return this._beforeClosed;
  }

  backdropClick(): Observable<MouseEvent> {
    return this._ref.backdropClick;
  }

  keydownEvents(): Observable<KeyboardEvent> {
    return this._ref.keydownEvents;
  }

  updatePosition(position?: DialogPosition): this {
    const strategy = this._ref.config.positionStrategy as GlobalPositionStrategy;

    if (position && (position.left || position.right)) {
      position.left ? strategy.left(position.left) : strategy.right(position.right);
    } else {
      strategy.centerHorizontally();
    }

    if (position && (position.top || position.bottom)) {
      position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
    } else {
      strategy.centerVertically();
    }

    this._ref.updatePosition();

    return this;
  }

  updateSize(width: string = '', height: string = ''): this {
    this._ref.updateSize(width, height);
    return this;
  }

  addPanelClass(classes: string | string[]): this {
    this._ref.addPanelClass(classes);
    return this;
  }

  removePanelClass(classes: string | string[]): this {
    this._ref.removePanelClass(classes);
    return this;
  }

  getState(): DialogState {
    return this._state;
  }

  private _finishDialogClose() {
    this._state = DialogState.CLOSED;
    this._ref.close(this._result, { focusOrigin: this._closeInteractionType });
    this.componentInstance = null;
  }

  _closeDialogVia<R>(ref: DialogRef<R>, interactionType: FocusOrigin, result?: R) {
    (ref as unknown as { _closeInteractionType: FocusOrigin })._closeInteractionType = interactionType;
    return ref.close(result);
  }
}
