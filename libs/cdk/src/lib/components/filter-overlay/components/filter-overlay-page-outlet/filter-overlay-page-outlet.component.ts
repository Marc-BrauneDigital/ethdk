import { NgComponentOutlet, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, TrackByFunction, ViewEncapsulation, inject } from '@angular/core';
import { AnimatedIfDirective, AnimatedLifecycleDirective } from '@ethlete/core';
import { FILTER_OVERLAY_REF } from '../../constants';
import { FilterOverlayPageWithLogic } from '../../types';

@Component({
  selector: 'et-filter-overlay-page-outlet',
  template: `
    <ng-container *ngFor="let page of filterOverlayRef._pages(); trackBy: trackByRoute">
      <div class="et-filter-overlay-page-outlet-page" etAnimatedLifecycle>
        <ng-container *etAnimatedIf="page.isActive()">
          <ng-container *ngComponentOutlet="page.component; inputs: page.inputs" />
        </ng-container>
      </div>
    </ng-container>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-filter-overlay-page-outlet',
  },
  styles: [
    `
      .et-filter-overlay-page-outlet {
        display: grid;
        overflow-x: hidden;
      }

      .et-filter-overlay-page-outlet-page {
        grid-area: 1 / 1 / 2 / 2;
        pointer-events: none;

        > * {
          pointer-events: auto;
        }

        &.et-animation-enter-from {
          transform: translateX(100%);
        }

        &.et-animation-leave-to {
          transform: translateX(-100%);
        }

        &.et-animation-enter-active {
          transition: transform 300ms var(--ease-out-5);
        }

        &.et-animation-leave-active {
          transition: transform 150ms var(--ease-in-5);
        }
      }
    `,
  ],
  imports: [NgFor, NgComponentOutlet, AnimatedIfDirective, AnimatedLifecycleDirective],
  hostDirectives: [],
})
export class FilterOverlayPageOutletComponent {
  protected readonly filterOverlayRef = inject(FILTER_OVERLAY_REF);

  protected readonly trackByRoute: TrackByFunction<FilterOverlayPageWithLogic> = (_, page) => page.route;
}
