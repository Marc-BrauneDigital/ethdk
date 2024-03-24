import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { createOverlayDismissChecker } from '../../../../utils';
import { ToggletipImports } from '../../../toggletip/toggletip.imports';
import { TooltipImports } from '../../../tooltip/tooltip.imports';
import { OVERLAY_DATA } from '../../constants';
import { OverlayBodyComponent } from '../../partials/overlay-body';
import { OverlayCloseDirective } from '../../partials/overlay-close';
import { OverlayFooterDirective } from '../../partials/overlay-footer';
import { OverlayHeaderDirective } from '../../partials/overlay-header';
import { OverlayHeaderTemplateDirective } from '../../partials/overlay-header-template';
import { OverlayMainDirective } from '../../partials/overlay-main';
import { OverlayRouteHeaderTemplateOutletComponent } from '../../partials/overlay-route-header-template-outlet';
import { OverlayRouterLinkDirective } from '../../partials/overlay-router-link';
import { OverlayRouterOutletComponent } from '../../partials/overlay-router-outlet';
import { OverlaySidebarComponent } from '../../partials/overlay-sidebar';
import { OverlayTitleDirective } from '../../partials/overlay-title';
import { FilterOverlayService, OverlayRef, OverlayRouterService, SidebarOverlayService } from '../../utils';
import { StorybookExampleService } from './overlay-host.storybook.component';

@Component({
  selector: 'et-sb-overlay',
  template: `
    <div etOverlayHeader>
      <h3 etOverlayTitle>Lorem header</h3>
    </div>
    <et-overlay-body dividers="dynamic">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, quia.</p>

      <p>Has example service injected?</p>
      <pre> {{ !!exampleService }} </pre>

      <button (click)="makeItScrollX = !makeItScrollX">Make it scroll X</button>
      @if (makeItScrollX) {
        <p style="width: 1500px;">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima
          fuga animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum
          repellendus voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis
          iusto vitae dolorem possimus laboriosam ipsum recusandae quos.
        </p>
      }

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <h4>Data</h4>
      <pre>{{ (data | json) || 'Noting passed' }}</pre>

      <input [formControl]="form.controls.foo" type="text" />
      <br /><br />

      <p etTooltip="Tooltip content!">I have a tooltip that closes by pressing esc without closing the overlay</p>

      <button
        [showToggletip]="showToggletip"
        (click)="showToggletip = !showToggletip"
        (toggletipClose)="showToggletip = false"
        etToggletip="Toggletip content!"
      >
        Show toggletip
      </button>
    </et-overlay-body>

    <div etOverlayFooter>
      <button (click)="close()" type="button">Close me</button>
      <button etOverlayClose type="button">Or close me</button>
      <button (click)="closeWithoutDismissCheck()" type="button">Or close me without dismiss check</button>
    </div>
  `,
  styles: [
    `
      .et-sb-overlay h3 {
        margin: 0;
      }
    `,
  ],
  standalone: true,
  imports: [
    OverlayTitleDirective,
    OverlayCloseDirective,
    OverlayHeaderDirective,
    OverlayBodyComponent,
    OverlayFooterDirective,
    JsonPipe,
    TooltipImports,
    ToggletipImports,
    ReactiveFormsModule,
  ],
  hostDirectives: [OverlayMainDirective],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'et-sb-overlay',
  },
})
export class OverlayStorybookComponent {
  protected readonly exampleService = inject(StorybookExampleService, { optional: true });
  private readonly _overlayRef = inject<OverlayRef<OverlayStorybookComponent>>(OverlayRef);
  protected readonly data = inject(OVERLAY_DATA);

  showToggletip = false;
  makeItScrollX = false;

  form = new FormGroup({
    foo: new FormControl(''),
    bar: new FormControl(''),
  });

  private readonly _dismissCheckerRef = createOverlayDismissChecker({
    form: this.form,
    dismissCheckFn: (v) => confirm(`Are you sure you want to close? ${JSON.stringify(v)}`),
  });

  closeWithoutDismissCheck() {
    this._dismissCheckerRef.destroy();
    this._overlayRef.close();
  }

  close() {
    this._overlayRef.close();
  }
}

@Component({
  selector: 'et-sb-new-overlay-sub-route1',
  template: `
    <p>Home</p>
    <ng-template etOverlayHeaderTemplate> Home </ng-template>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route1-host',
  },
  imports: [OverlayHeaderTemplateDirective],
  hostDirectives: [],
})
export class NewOverlaySubRoute1StorybookComponent {
  router = inject(OverlayRouterService);
  filter = inject(FilterOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-sub-route2',
  template: ` <p>Sub route 2</p>
    <ng-template etOverlayHeaderTemplate> Sub route 2</ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route2-host',
  },
  imports: [OverlayHeaderTemplateDirective],
  hostDirectives: [],
})
export class NewOverlaySubRoute2StorybookComponent {
  router = inject(OverlayRouterService);
  filter = inject(FilterOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-sub-route3',
  template: ` <p>Sub route 3</p>
    <ng-template etOverlayHeaderTemplate>Sub route 3 </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route3-host',
  },
  imports: [OverlayHeaderTemplateDirective],
  hostDirectives: [],
})
export class NewOverlaySubRoute3StorybookComponent {
  router = inject(OverlayRouterService);
  filter = inject(FilterOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-sub-route4',
  template: `
    <et-overlay-header>
      <h3>Home</h3>
    </et-overlay-header>

    <et-overlay-body dividers="dynamic">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore ex natus libero nulla omnis dolores minima fuga
        animi ipsum est delectus, numquam cum architecto! Aperiam adipisci praesentium incidunt voluptatum repellendus
        voluptas voluptatibus cupiditate sed illum nobis sit, illo itaque explicabo accusamus perspiciatis iusto vitae
        dolorem possimus laboriosam ipsum recusandae quos.
      </p>
    </et-overlay-body>

    @if (!sidebar.renderSidebar()) {
      <et-overlay-footer>
        <button etOverlayRouterLink="/sidebar">Sidebar</button>
      </et-overlay-footer>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route1-host',
  },
  imports: [
    OverlayHeaderTemplateDirective,
    OverlayRouterLinkDirective,
    OverlayHeaderDirective,
    OverlayFooterDirective,
    OverlayBodyComponent,
  ],
  hostDirectives: [OverlayMainDirective],
})
export class NewOverlaySubRoute4StorybookComponent {
  router = inject(OverlayRouterService);
  sidebar = inject(SidebarOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-sub-route5',
  template: `
    <et-overlay-header>
      <h3>Route 2</h3>
    </et-overlay-header>

    <et-overlay-body>
      <p>lorem ipsum</p>
    </et-overlay-body>

    <et-overlay-footer>
      <button etOverlayRouterLink="/">Home</button>

      @if (!sidebar.renderSidebar()) {
        <button etOverlayRouterLink="/sidebar">Sidebar</button>
      }
    </et-overlay-footer>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route2-host',
  },
  imports: [
    OverlayHeaderTemplateDirective,
    OverlayRouterLinkDirective,
    OverlayHeaderDirective,
    OverlayFooterDirective,
    OverlayBodyComponent,
  ],
  hostDirectives: [OverlayMainDirective],
})
export class NewOverlaySubRoute5StorybookComponent {
  router = inject(OverlayRouterService);
  sidebar = inject(SidebarOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-sub-route6',
  template: `
    <et-overlay-header>
      <h3>Route 3</h3>
    </et-overlay-header>

    <et-overlay-body>
      <p>lorem ipsum</p>
    </et-overlay-body>

    <et-overlay-footer>
      <button etOverlayRouterLink="/">Home</button>
      @if (!sidebar.renderSidebar()) {
        <button etOverlayRouterLink="/sidebar">Sidebar</button>
      }
    </et-overlay-footer>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-sub-route3-host',
  },
  imports: [
    OverlayHeaderTemplateDirective,
    OverlayRouterLinkDirective,
    OverlayHeaderDirective,
    OverlayFooterDirective,
    OverlayBodyComponent,
  ],
  hostDirectives: [OverlayMainDirective],
})
export class NewOverlaySubRoute6StorybookComponent {
  router = inject(OverlayRouterService);
  sidebar = inject(SidebarOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay',
  template: `
    <et-overlay-header>
      <h3 etOverlayTitle>
        <et-overlay-route-header-template-outlet />
      </h3>
    </et-overlay-header>

    <et-overlay-body>
      <et-overlay-router-outlet />
    </et-overlay-body>

    <et-overlay-footer>
      <button etOverlayRouterLink="/">Home</button>
      <button etOverlayRouterLink="/sub-route">Sub route</button>
      <button etOverlayRouterLink="/sub-route-2">Sub route 2</button>
    </et-overlay-footer>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-host',
  },
  imports: [
    OverlayRouterOutletComponent,
    OverlayRouterLinkDirective,
    OverlayHeaderDirective,
    OverlayFooterDirective,
    OverlayBodyComponent,
    OverlayTitleDirective,
    OverlayRouteHeaderTemplateOutletComponent,
  ],
  hostDirectives: [OverlayMainDirective],
  providers: [OverlayRouterService, FilterOverlayService],
})
export class NewOverlayStorybookComponent {
  router = inject(OverlayRouterService);
  filter = inject(FilterOverlayService);
}

@Component({
  selector: 'et-sb-new-overlay-with-nav',
  template: `
    <et-overlay-sidebar>
      <ng-template etOverlayHeaderTemplate> <h3>Navigation</h3> </ng-template>

      <button etOverlayRouterLink="/">Home</button> <br />
      <br />
      <button etOverlayRouterLink="/sub-route">Sub route</button> <br />
      <br />
      <button etOverlayRouterLink="/sub-route-2">Sub route 2</button>
      <br />
      <br />
      <br />

      <button etOverlayClose>Close</button> <br />
    </et-overlay-sidebar>

    <et-overlay-router-outlet />
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'et-sb-new-overlay-with-nav',
  },
  styles: `
    .et-sb-new-overlay-with-nav {
      &:has(.et-overlay-sidebar--visible) {
        .et-overlay-sidebar-host {
          border-right: 1px solid #000;
          padding: 1rem;
        }
      }

      .et-overlay-router-outlet-page > * {
        background: #282828;
      }
    }
  `,
  imports: [
    OverlayRouterOutletComponent,
    OverlayMainDirective,
    OverlaySidebarComponent,
    OverlayRouterLinkDirective,
    OverlayHeaderDirective,
    OverlayFooterDirective,
    OverlayBodyComponent,
    OverlayTitleDirective,
    OverlayHeaderTemplateDirective,
    OverlayRouteHeaderTemplateOutletComponent,
    OverlayCloseDirective,
  ],
  providers: [OverlayRouterService, SidebarOverlayService],
})
export class NewOverlayWithNavStorybookComponent {
  router = inject(OverlayRouterService);
  sidebar = inject(SidebarOverlayService);
}
