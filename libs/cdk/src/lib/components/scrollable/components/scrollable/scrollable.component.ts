import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  CursorDragScrollDirective,
  LetDirective,
  NgClassType,
  ObserveScrollStateDirective,
  ScrollObserverScrollState,
  ScrollToElementOptions,
  createCanAnimateSignal,
  createIsRenderedSignal,
  getIntersectionInfo,
  scrollToElement,
  signalClasses,
  signalElementChildren,
  signalElementDimensions,
  signalElementIntersection,
  signalElementScrollState,
  signalHostAttributes,
  signalHostClasses,
  signalHostStyles,
} from '@ethlete/core';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  filter,
  fromEvent,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ChevronIconComponent } from '../../../icons/chevron-icon';
import { ScrollableIgnoreChildDirective, isScrollableChildIgnored } from '../../directives/scrollable-ignore-child';
import {
  SCROLLABLE_IS_ACTIVE_CHILD_TOKEN,
  ScrollableIsActiveChildDirective,
} from '../../directives/scrollable-is-active-child';
import { ScrollableIntersectionChange, ScrollableScrollMode } from '../../types';

// Thresholds for the intersection observer.
const ELEMENT_INTERSECTION_THRESHOLD = [
  // 5% steps
  ...Array.from({ length: 21 }, (_, i) => i * 0.05),

  // Additional steps needed since display scaling can cause the intersection ratio to be slightly off.
  0.01,
  0.005,
  0.001,
  0.99,
  0.995,
  0.999,
];

interface ScrollableNavigationItem {
  isActive: boolean;
  activeOffset: number;
  element: HTMLElement;
}

export type ScrollableButtonPosition = 'inside' | 'footer';
export type ScrollableScrollOrigin = 'auto' | 'center' | 'start' | 'end';
export type ScrollableDirection = 'horizontal' | 'vertical';
export type ScrollableItemSize = 'auto' | 'same' | 'full';

@Component({
  selector: 'et-scrollable',
  templateUrl: './scrollable.component.html',
  styleUrls: ['./scrollable.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CursorDragScrollDirective,
    ObserveScrollStateDirective,
    NgClass,
    LetDirective,
    ChevronIconComponent,
    ScrollableIsActiveChildDirective,
    ScrollableIgnoreChildDirective,
    NgTemplateOutlet,
  ],
  host: {
    class: 'et-scrollable',
  },
})
export class ScrollableComponent {
  private _isCursorDragging$ = new BehaviorSubject<boolean>(false);
  private _disableSnapping$ = new Subject<void>();
  private _manualActiveNavigationIndex = signal<number | null>(null);

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  itemSize = input<ScrollableItemSize>('auto');
  direction = input<ScrollableDirection>('horizontal');
  scrollableRole = input<string | null>(null);
  scrollableClass = input<NgClassType | null>(null);
  renderNavigation = input(false, { transform: booleanAttribute });
  renderMasks = input(true, { transform: booleanAttribute });
  renderButtons = input(true, { transform: booleanAttribute });
  buttonPosition = input<ScrollableButtonPosition>('inside');
  renderScrollbars = input(false, { transform: booleanAttribute });
  stickyButtons = input(false, { transform: booleanAttribute });
  cursorDragScroll = input(true, { transform: booleanAttribute });
  disableActiveElementScrolling = input(false, { transform: booleanAttribute });
  scrollMode = input<ScrollableScrollMode>('container');
  snap = input(false, { transform: booleanAttribute });
  scrollMargin = input(0, { transform: numberAttribute });
  scrollOrigin = input<ScrollableScrollOrigin>('auto');
  darkenNonIntersectingItems = input(false, { transform: booleanAttribute });

  scrollStateChange = output<ScrollObserverScrollState>();
  intersectionChange = output<ScrollableIntersectionChange[]>();

  scrollable = viewChild<ElementRef<HTMLElement>>('scrollable');
  firstElement = viewChild<ElementRef<HTMLElement>>('firstElement');
  lastElement = viewChild<ElementRef<HTMLElement>>('lastElement');
  activeElementList = contentChildren(SCROLLABLE_IS_ACTIVE_CHILD_TOKEN, { descendants: true });
  navigationDotsContainer = viewChild<ElementRef<HTMLElement>>('navigationDotsContainer');
  firstNavigationDot = viewChild<ElementRef<HTMLButtonElement>>('navigationDot');
  navigationDotDimensions = signalElementDimensions(this.firstNavigationDot);

  isRendered = createIsRenderedSignal();
  canAnimate = createCanAnimateSignal();

  renderButtonsInside = computed(() => this.buttonPosition() === 'inside' && this.renderButtons());
  renderButtonsInFooter = computed(() => this.buttonPosition() === 'footer' && this.renderButtons());

  containerScrollState = signalElementScrollState(this.scrollable, {
    initialScrollPosition: computed(() => {
      const scrollable = this.scrollable()?.nativeElement;
      const activeElementList = this.activeElementList();

      if (!scrollable || !activeElementList.length || !this.isRendered.state()) return null;

      const firstActive = activeElementList.find((a) => a.isActiveChildEnabled());

      if (firstActive && !this.disableActiveElementScrolling()) {
        const offsetTop = firstActive.elementRef.nativeElement.offsetTop - scrollable.offsetTop;
        const offsetLeft = firstActive.elementRef.nativeElement.offsetLeft - scrollable.offsetLeft;

        return {
          x: offsetLeft - this.scrollMargin(),
          y: offsetTop - this.scrollMargin(),
        };
      }

      return null;
    }),
  });
  firstElementIntersection = signalElementIntersection(this.firstElement, {
    root: this.scrollable,
    enabled: this.isRendered.state,
  });
  lastElementIntersection = signalElementIntersection(this.lastElement, {
    root: this.scrollable,
    enabled: this.isRendered.state,
  });
  allScrollableChildren = signalElementChildren(this.scrollable);
  scrollableChildren = computed(() => this.allScrollableChildren().filter((c) => !isScrollableChildIgnored(c)));

  scrollableContentIntersections = signalElementIntersection(this.scrollableChildren, {
    root: this.scrollable,
    threshold: ELEMENT_INTERSECTION_THRESHOLD,
    enabled: this.isRendered.state,
  });
  scrollableContentIntersections$ = toObservable(this.scrollableContentIntersections);

  nonScrollableIntersections = computed(
    () => {
      const allIntersections = this.scrollableContentIntersections();
      return allIntersections.filter((i) => i.intersectionRatio !== 1).map((i) => i.target as HTMLElement);
    },
    { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) },
  );

  allScrollableElements = computed(
    () => {
      return this.scrollableContentIntersections().map((i) => i.target as HTMLElement);
    },
    { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) },
  );

  canScroll = computed(() => {
    const dir = this.direction();

    if (dir === 'horizontal') {
      return this.containerScrollState().canScrollHorizontally;
    }

    return this.containerScrollState().canScrollVertically;
  });

  isAtStart = computed(() => {
    if (!this.canScroll()) {
      return true;
    }

    const intersection = this.firstElementIntersection()[0];

    if (!intersection) return false;

    return intersection.isIntersecting;
  });

  isAtEnd = computed(() => {
    if (!this.canScroll()) {
      return true;
    }

    const intersection = this.lastElementIntersection()[0];

    if (!intersection) return false;

    return intersection.isIntersecting;
  });

  scrollableNavigation = computed<ScrollableNavigationItem[]>(() => {
    const allIntersections = this.scrollableContentIntersections();
    const manualActiveNavigationIndex = this._manualActiveNavigationIndex();

    const highestIntersection = allIntersections.reduce((prev, curr) => {
      if (prev && prev.intersectionRatio > curr.intersectionRatio) {
        return prev;
      }

      return curr;
    }, allIntersections[0]);

    if (!highestIntersection) {
      return [];
    }

    const activeIndex =
      manualActiveNavigationIndex !== null
        ? manualActiveNavigationIndex
        : allIntersections.findIndex((i) => i === highestIntersection);

    return allIntersections.map((i, index) => ({
      isActive:
        manualActiveNavigationIndex !== null
          ? manualActiveNavigationIndex === index
          : i === highestIntersection && highestIntersection.intersectionRatio > 0,
      activeOffset: index === activeIndex ? 0 : Math.abs(index - activeIndex),
      element: i.target as HTMLElement,
    }));
  });

  activeIndex = computed(() => {
    const scrollableNavigation = this.scrollableNavigation();
    const activeIndex = scrollableNavigation.findIndex((element) => element.isActive);

    return activeIndex;
  });

  allChildElementClassBindings = signalClasses(this.allScrollableElements, {
    'et-scrollable-item': signal(true),
  });

  nonFullIntersectingElementClassBindings = signalClasses(this.nonScrollableIntersections, {
    'et-scrollable-item--not-intersecting': signal(true),
  });

  hostAttributeBindings = signalHostAttributes({
    'item-size': this.itemSize,
    direction: this.direction,
    'render-scrollbars': this.renderScrollbars,
    'sticky-buttons': computed(() => this.stickyButtons() && this.renderButtonsInside()),
  });

  hostClassBindings = signalHostClasses({
    'et-scrollable--can-scroll': computed(() => this.canScroll() && (!this.isAtStart() || !this.isAtEnd())),
    'et-scrollable--is-at-start': this.isAtStart,
    'et-scrollable--is-at-end': this.isAtEnd,
    'et-scrollable--can-animate': this.canAnimate.state,
    'et-scrollable--darken-non-intersecting-items': this.darkenNonIntersectingItems,
  });

  hostStyleBindings = signalHostStyles({
    '--item-count': computed(() => this.scrollableChildren().length),
  });

  constructor() {
    effect(() => {
      // Responsible for centering the active dot in navigation bar by using 'translate'
      const scrollableDotsContainer = this.navigationDotsContainer();
      const activeIndex = this.activeIndex();
      const childCount = this.scrollableContentIntersections().length;

      const offset = this.getNavigationDotsContainerTranslate(childCount, activeIndex);

      if (!scrollableDotsContainer) return;

      const dir = this.direction() === 'horizontal' ? 'X' : 'Y';

      scrollableDotsContainer.nativeElement.style.transform = `translate${dir}(${offset})`;
    });

    effect(() => {
      const isAtStart = this.isAtStart();
      const isAtEnd = this.isAtEnd();
      const canScroll = this.canScroll();

      this.scrollStateChange.emit({
        canScroll,
        isAtEnd: !!isAtEnd,
        isAtStart: !!isAtStart,
      });
    });

    effect(() => {
      const enableSnapping = this.snap();

      if (enableSnapping) {
        this._enableSnapping();
      } else {
        this._disableSnapping();
      }
    });

    this.scrollableContentIntersections$
      .pipe(
        takeUntilDestroyed(),
        debounceTime(10),
        tap((entries) => {
          this.intersectionChange.emit(
            entries.map((i, index) => ({
              index,
              element: i.target as HTMLElement,
              intersectionRatio: i.intersectionRatio,
              isIntersecting: i.isIntersecting,
            })),
          );
        }),
      )
      .subscribe();

    toObservable(this._manualActiveNavigationIndex)
      .pipe(
        filter((i) => i !== null),
        takeUntilDestroyed(),
        switchMap(() => {
          const scrollable = this.scrollable()?.nativeElement;

          if (!scrollable) {
            return of(null);
          }

          return fromEvent(scrollable, 'scroll');
        }),
        debounceTime(50),
        tap(() => this._manualActiveNavigationIndex.set(null)),
      )
      .subscribe();

    this.isRendered.bind();
  }

  getNavigationDotsContainerTranslate(navigationDotCount: number, activeIndex: number) {
    if (navigationDotCount <= 5) {
      return '0px';
    } else {
      const dotContainerWidth = this.navigationDotDimensions().rect?.width ?? 20;
      let offset = -(activeIndex - 2);
      if (activeIndex < 3) {
        offset = 0;
      } else if (activeIndex >= navigationDotCount - 3) {
        offset = 5 - navigationDotCount;
      }
      return `${offset * dotContainerWidth}px`;
    }
  }

  scrollOneContainerSize(direction: 'start' | 'end') {
    const scrollElement = this.scrollable()?.nativeElement;

    if (!scrollElement) {
      return;
    }

    const parent = this.elementRef.nativeElement;

    const isSnappingEnabled = this.snap();

    if (isSnappingEnabled) {
      // If snapping is enabled we want to scroll to a position where no further snapping will happen after the scroll.
      const allIntersections = this.scrollableContentIntersections();
      const intersections = getIntersectionInfo(allIntersections);
      const relevantIntersection = direction === 'start' ? intersections?.partial.first : intersections?.partial.last;

      if (!relevantIntersection) return;

      const nextIndex =
        relevantIntersection.intersection.intersectionRatio !== 1
          ? relevantIntersection.index
          : direction === 'start'
            ? relevantIntersection.index - 1
            : relevantIntersection.index + 1;

      const element =
        (allIntersections[nextIndex]?.target as HTMLElement) ||
        (relevantIntersection.intersection.target as HTMLElement);

      this.scrollToElement({
        element: element,
        origin: direction === 'end' ? 'start' : 'end',
      });
    } else {
      // Just scroll one size of the scrollable container.
      const scrollableSize = this.direction() === 'horizontal' ? parent.clientWidth : parent.clientHeight;
      const currentScroll = this.direction() === 'horizontal' ? scrollElement.scrollLeft : scrollElement.scrollTop;

      scrollElement.scrollTo({
        [this.direction() === 'horizontal' ? 'left' : 'top']:
          currentScroll + (direction === 'start' ? -scrollableSize : scrollableSize),
        behavior: 'smooth',
      });
    }
  }

  scrollOneItemSize(direction: 'start' | 'end') {
    const allIntersections = this.scrollableContentIntersections();
    const scrollElement = this.scrollable()?.nativeElement;

    if (!allIntersections.length) {
      if (isDevMode()) {
        console.warn(
          'No elements found to scroll to. Make sure to apply the isElement directive to the elements you want to scroll to.',
        );
      }
      return;
    }

    const intersections = getIntersectionInfo(allIntersections);

    if (!intersections || !scrollElement) return;

    // Means the current element is bigger than the scrollable container.
    // In this case we should scroll to the start of the current element. If we are already there we should scroll to the end of the previous element.
    // This applies to the other direction as well.
    const isFirstAndLastIntersectionEqual =
      intersections.partial.first.intersection === intersections.partial.last.intersection;
    const scrollableRect = scrollElement.getBoundingClientRect();

    if (isFirstAndLastIntersectionEqual) {
      const intersection = intersections.partial.first.intersection.target.getBoundingClientRect();
      const isStartOfElementVisible =
        this.direction() === 'horizontal'
          ? Math.round(intersection.left) >= Math.round(scrollableRect.left)
          : Math.round(intersection.top) >= Math.round(scrollableRect.top);

      const isEndOfElementVisible =
        this.direction() === 'horizontal'
          ? Math.round(intersection.right) <= Math.round(scrollableRect.right)
          : Math.round(intersection.bottom) <= Math.round(scrollableRect.bottom);

      if (!isStartOfElementVisible || !isEndOfElementVisible) {
        if (direction === 'start') {
          if (isStartOfElementVisible) {
            // to the end of the previous element
            const previousIndex = intersections.partial.first.index - 1;
            const elementToScrollTo = allIntersections[previousIndex]?.target as HTMLElement;

            if (!elementToScrollTo) return;
            this.scrollToElement({
              element: elementToScrollTo,
              origin: 'end',
            });
            this._manualActiveNavigationIndex.set(previousIndex);
          } else {
            // to the start of the current element
            this.scrollToElement({
              element: intersections.partial.first.intersection.target as HTMLElement,
              origin: 'start',
            });
            this._manualActiveNavigationIndex.set(intersections.partial.first.index);
          }
        } else {
          if (isEndOfElementVisible) {
            // to the start of the next element
            const nextIndex = intersections.partial.last.index + 1;
            const elementToScrollTo = allIntersections[nextIndex]?.target as HTMLElement;

            if (!elementToScrollTo) return;
            this.scrollToElement({
              element: elementToScrollTo,
              origin: 'start',
            });
            this._manualActiveNavigationIndex.set(nextIndex);
          } else {
            // to the end of the current element
            this.scrollToElement({
              element: intersections.partial.last.intersection.target as HTMLElement,
              origin: 'end',
            });

            this._manualActiveNavigationIndex.set(intersections.partial.last.index);
          }
        }

        return;
      }
    } else if (this.scrollOrigin() === 'center') {
      // If the scroll origin is forced to be center we should always snap to the center of the next partial intersection in the scroll direction.
      const nextPartialIntersection = direction === 'start' ? intersections.partial.first : intersections.partial.last;
      const nextIndex = nextPartialIntersection.index;

      this.scrollToElement({
        element: nextPartialIntersection.intersection.target as HTMLElement,
        origin: 'center',
      });
      this._manualActiveNavigationIndex.set(nextIndex);

      return;
    }

    const data = direction === 'start' ? intersections.partial.first : intersections.partial.last;
    let elementToScrollTo = data.intersection.target as HTMLElement;
    let nextIndex = data.index;

    if (Math.round(data.intersection.intersectionRatio) === 1) {
      if (direction === 'start' && data.index === 0) {
        return;
      }

      if (direction === 'end' && data.index === allIntersections.length - 1) {
        return;
      }

      nextIndex = direction === 'start' ? data.index - 1 : data.index + 1;

      elementToScrollTo = allIntersections[nextIndex]?.target as HTMLElement;

      if (!elementToScrollTo) return;
    }

    this.scrollToElement({
      element: elementToScrollTo,
      origin: direction,
    });

    this._manualActiveNavigationIndex.set(nextIndex);
  }

  scrollToElement(options: Omit<ScrollToElementOptions, 'container'> & { ignoreForcedOrigin?: boolean }) {
    const scrollElement = this.scrollable()?.nativeElement;
    const { origin } = options;
    const forcedOrigin = this.scrollOrigin();

    scrollToElement({
      container: scrollElement,
      direction: this.direction() === 'horizontal' ? 'inline' : 'block',
      ...(this.direction() === 'horizontal'
        ? { scrollInlineMargin: this.scrollMargin() }
        : { scrollBlockMargin: this.scrollMargin() }),
      ...options,
      ...(forcedOrigin === 'auto' || options.ignoreForcedOrigin ? { origin } : { origin: forcedOrigin }),
    });
  }

  scrollToElementByIndex(
    options: Omit<ScrollToElementOptions, 'container'> & { index: number; ignoreForcedOrigin?: boolean },
  ) {
    const elements = this.scrollableChildren();
    const { origin } = options;
    const forcedOrigin = this.scrollOrigin();

    if (!elements.length) {
      if (isDevMode()) {
        console.warn('No elements found to scroll to.');
      }
      return;
    }

    const scrollElement = this.scrollable()?.nativeElement;
    const element = elements[options.index];

    scrollToElement({
      container: scrollElement,
      element,
      ...(this.direction() === 'horizontal'
        ? { scrollInlineMargin: this.scrollMargin() }
        : { scrollBlockMargin: this.scrollMargin() }),
      ...options,
      ...(forcedOrigin === 'auto' || options.ignoreForcedOrigin ? { origin } : { origin: forcedOrigin }),
    });
  }

  protected scrollToElementViaNavigation(elementIndex: number) {
    const element = this.scrollableChildren()[elementIndex];
    this._manualActiveNavigationIndex.set(elementIndex);

    this.scrollToElement({
      element,
    });
  }

  protected setIsCursorDragging(isDragging: boolean) {
    this._isCursorDragging$.next(isDragging);
  }

  protected scrollToStartDirection() {
    if (this.scrollMode() === 'container') {
      this.scrollOneContainerSize('start');
    } else {
      this.scrollOneItemSize('start');
    }
  }

  protected scrollToEndDirection() {
    if (this.scrollMode() === 'container') {
      this.scrollOneContainerSize('end');
    } else {
      this.scrollOneItemSize('end');
    }
  }

  private _enableSnapping() {
    combineLatest([this.scrollableContentIntersections$, this._isCursorDragging$])
      .pipe(
        filter(([, isDragging]) => !isDragging),
        map(([intersections]) => intersections),
        debounceTime(150),
        tap((allIntersections) => {
          const scrollElement = this.scrollable()?.nativeElement;

          if (!scrollElement) return;

          const intersections = getIntersectionInfo(allIntersections);

          if (!intersections) return;

          const isFirstAndLastIntersectionEqual =
            intersections.partial.first.intersection === intersections.partial.last.intersection;
          const scrollableRect = scrollElement.getBoundingClientRect();

          if (this.scrollOrigin() === 'center' && intersections.full.hasMultiple) {
            // If there is more than one fully visible element we should not snap at all.
            return;
          } else if (this.scrollOrigin() === 'center' && intersections.full.first.intersection) {
            // If there is already a fully visible element we should snap it to the center.
            this.scrollToElement({
              element: intersections.full.first.intersection.target as HTMLElement,
              origin: 'center',
            });
            return;
          } else if (isFirstAndLastIntersectionEqual) {
            const intersection = intersections.partial.first.intersection.target.getBoundingClientRect();
            const isStartOfElementVisible =
              this.direction() === 'horizontal'
                ? intersection.left >= scrollableRect.left
                : intersection.top >= scrollableRect.top;

            const isEndOfElementVisible =
              this.direction() === 'horizontal'
                ? intersection.right <= scrollableRect.right
                : intersection.bottom <= scrollableRect.bottom;

            // Don't snap if neither the start nor the end of the current element is visible.
            // Otherwise this would result in parts of the element being inaccessible.
            if (!isStartOfElementVisible && !isEndOfElementVisible) return;

            // If the start of the element is visible we should snap to the start.
            if (isStartOfElementVisible) {
              this.scrollToElement({
                element: intersections.partial.first.intersection.target as HTMLElement,
                origin: 'start',
              });
              return;
            }

            // If the end of the element is visible we should snap to the end.
            if (isEndOfElementVisible) {
              this.scrollToElement({
                element: intersections.partial.last.intersection.target as HTMLElement,
                origin: 'end',
              });
              return;
            }
          } else if (
            (this.direction() === 'horizontal' &&
              intersections.partial.biggest.intersection.boundingClientRect.width > scrollableRect.width) ||
            (this.direction() === 'vertical' &&
              intersections.partial.biggest.intersection.boundingClientRect.height > scrollableRect.height)
          ) {
            // If the current element is bigger than the scrollable container we should snap to the start of the current element if the scroll direction is forward
            // and to the end of the current element if the scroll direction is backwards.
            const origin = intersections.partial.biggest.index === intersections.partial.first.index ? 'end' : 'start';

            this.scrollToElement({
              element: intersections.partial.biggest.intersection.target as HTMLElement,
              origin,
              ignoreForcedOrigin: true,
            });
          } else {
            // No special case. Just snap to the biggest intersection.
            this.scrollToElement({
              element: intersections.partial.biggest.intersection.target as HTMLElement,
            });
          }
        }),
        takeUntil(this._disableSnapping$),
      )
      .subscribe();
  }

  private _disableSnapping() {
    this._disableSnapping$.next();
  }
}
