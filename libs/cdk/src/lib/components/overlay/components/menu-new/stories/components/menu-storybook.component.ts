import { OverlayModule } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Injectable, ViewEncapsulation, inject } from '@angular/core';
import { CheckboxImports } from '../../../../../forms';
import { MENU, MenuCheckboxItemComponent, MenuComponent } from '../../components';
import { MenuCheckboxGroupDirective, MenuItemDirective, MenuTriggerDirective } from '../../directives';
import { MenuGroupDirective } from '../../directives/menu-group';
import { MenuGroupTitleDirective } from '../../directives/menu-group-title';

@Injectable()
export class TestService {}

@Component({
  selector: 'et-sb-menu-item',
  standalone: true,
  template: `<p>Menu</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MenuItemStorybookComponent {
  x = inject(MENU);
  testService = inject(TestService);
}

@Component({
  selector: 'et-sb-menu',
  template: `
    <div class="row">
      <button [etMenuTrigger]="menuTpl">Menu</button>
      <button [etMenuTrigger]="menuTpl">Menu</button>
      <button [etMenuTrigger]="menuTpl">Menu</button>
    </div>

    <div class="row">
      <button [etMenuTrigger]="menuTpl">Menu</button>
      <button [etMenuTrigger]="menuTpl">Menu</button>
      <button [etMenuTrigger]="menuTpl">Menu</button>
    </div>

    <ng-template #menuTpl>
      <et-menu>
        <p etMenuItem>Lorem, ipsum dolor.</p>
        <p etMenuItem>Lorem, ipsum dolor.</p>
        <p etMenuItem>Lorem, ipsum dolor.</p>

        <div etMenuGroup>
          <span etMenuGroupTitle>Group Title</span>
          <p etMenuItem>Lorem, ipsum dolor.</p>
          <p etMenuItem>Lorem, ipsum dolor.</p>
          <p etMenuItem>Lorem, ipsum dolor.</p>
        </div>

        <div etMenuCheckboxGroup>
          <span etMenuGroupTitle>Checkbox group Title</span>
          <et-menu-checkbox-item etCheckboxGroupControl>All </et-menu-checkbox-item>
          <et-menu-checkbox-item>Checkbox item</et-menu-checkbox-item>
          <et-menu-checkbox-item>Checkbox item</et-menu-checkbox-item>
          <et-menu-checkbox-item>Checkbox item</et-menu-checkbox-item>
        </div>
      </et-menu>
    </ng-template>
  `,
  styles: [
    `
      et-sb-menu {
        height: 120vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-bottom: 700px;
        .row {
          display: flex;
          justify-content: space-between;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    MenuTriggerDirective,
    MenuGroupDirective,
    MenuGroupTitleDirective,
    OverlayModule,
    MenuComponent,
    MenuItemDirective,
    MenuItemStorybookComponent,
    MenuCheckboxGroupDirective,
    MenuCheckboxItemComponent,
    CheckboxImports,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TestService],
})
export class MenuStorybookComponent {}
