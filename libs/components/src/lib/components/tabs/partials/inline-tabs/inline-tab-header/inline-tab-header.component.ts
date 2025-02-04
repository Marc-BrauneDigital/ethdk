import { Directionality } from '@angular/cdk/bidi';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  NgZone,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ObserveContentDirective, ScrollObserverIgnoreTargetDirective, TypedQueryList } from '@ethlete/core';
import { ScrollableComponent } from '../../../../scrollable';
import { ActiveTabUnderlineBarManager, ActiveTabUnderlineDirective, PaginatedTabHeaderDirective } from '../../../utils';
import { InlineTabLabelWrapperDirective } from '../inline-tab-label-wrapper';

@Component({
  selector: 'et-inline-tab-header',
  templateUrl: 'inline-tab-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ScrollableComponent, NgClass, ObserveContentDirective, ScrollObserverIgnoreTargetDirective],
  host: {
    class: 'et-inline-tab-header',
  },
})
export class InlineTabHeaderComponent
  extends PaginatedTabHeaderDirective
  implements AfterContentChecked, AfterContentInit, OnDestroy
{
  @ContentChildren(InlineTabLabelWrapperDirective, { descendants: false })
  _items!: TypedQueryList<InlineTabLabelWrapperDirective>;

  @ViewChild(ScrollableComponent, { static: true })
  _scrollable!: ScrollableComponent;

  @ContentChildren(forwardRef(() => ActiveTabUnderlineDirective), { descendants: true })
  _inkBars!: TypedQueryList<ActiveTabUnderlineDirective>;

  _activeTabUnderlineManager?: ActiveTabUnderlineBarManager;

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    @Optional() dir: Directionality,
    ngZone: NgZone,
  ) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone);
  }

  override ngAfterContentInit() {
    this._activeTabUnderlineManager = new ActiveTabUnderlineBarManager(this._inkBars);
    super.ngAfterContentInit();
  }

  protected _itemSelected(event: KeyboardEvent) {
    event.preventDefault();
  }
}
