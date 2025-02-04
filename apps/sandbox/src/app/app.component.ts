/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  BottomSheetService,
  BracketComponent,
  BRACKET_MATCH_ID_TOKEN,
  ButtonComponent,
  CheckboxImports,
  createBracketConfig,
  DialogService,
  InputImports,
  InputSuffixDirective,
  LabelImports,
  QueryButtonComponent,
  RadioImports,
  SlideToggleImports,
} from '@ethlete/components';
import { ContentfulImports, RichTextResponse } from '@ethlete/contentful';
import { RouterStateService, SeoDirective, StructuredDataComponent, ViewportService } from '@ethlete/core';
import { ThemeProviderDirective } from '@ethlete/theming';
import { JsonLD } from '@ethlete/types';
import { BehaviorSubject, delay, map, of, startWith } from 'rxjs';
import { StorybookMasonryComponent } from '../../../../libs/components/src/lib/components/masonry/stories/components/masonry-storybook.component';
import { ToggletipStorybookComponent } from '../../../../libs/components/src/lib/components/overlay/components/toggletip/stories/components/toggletip-storybook.component';
import { AsyncTableComponent } from './async-table.component';
import { discoverMovies } from './async-table.queries';
import { BottomSheetExampleComponent } from './bottom-sheet-example.component';
import {
  CONTENTFUL_RICHTEXT_TEST_DATA_DE,
  CONTENTFUL_RICHTEXT_TEST_DATA_EN,
  CONTENTFUL_RICH_TEXT_DUMMY_DATA,
} from './contentful-rich-text-dummy-data';
import { DialogExampleComponent } from './dialog-example.component';

@Component({
  selector: 'ethlete-test-comp',
  template: `<span>test {{ matchId }}</span>`,
  styles: [
    `
      :host {
        display: block;
        border: 1px solid red;
        height: 100px;
      }
    `,
  ],
  standalone: true,
  hostDirectives: [SeoDirective],
})
export class TestCompComponent {
  matchId = inject(BRACKET_MATCH_ID_TOKEN, { optional: true });
  seoDirective = inject(SeoDirective);

  title$ = new BehaviorSubject('bar');
  foo$ = new BehaviorSubject<string | null>('bar');

  constructor() {
    this.seoDirective.updateConfig({
      title: this.title$,
      foo: this.foo$,
      canonical: 'foo',
      description: 'foo',
      og: {
        title: 'foo',
        description: 'bar',
        type: 'foo',
        url: 'bar',
        image: 'foo',
        siteName: 'bar',
        locale: 'foo',
        localeAlternate: ['foo', 'bar'],
      },
    });

    setTimeout(() => {
      this.title$.next('bar - baz');
      this.foo$.next(null);
    }, 2500);
  }
}

@Component({
  selector: 'ethlete-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    ThemeProviderDirective,
    AsyncPipe,
    JsonPipe,
    AsyncTableComponent,
    BracketComponent,
    ContentfulImports,
    TestCompComponent,
    NgIf,
    StructuredDataComponent,
    ButtonComponent,
    QueryButtonComponent,
    ReactiveFormsModule,
    CheckboxImports,
    InputImports,
    LabelImports,
    RadioImports,
    SlideToggleImports,
    InputSuffixDirective,
    RouterOutlet,
    RouterLink,
    StorybookMasonryComponent,
    ToggletipStorybookComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [SeoDirective],
})
export class AppComponent {
  disabled = false;
  page = 1;

  currentTheme = 'primary';
  seoDirective = inject(SeoDirective);

  config = createBracketConfig({ matchComponent: TestCompComponent });

  contentfulData = CONTENTFUL_RICH_TEXT_DUMMY_DATA;

  seoShowComp = true;
  contentfulRichTextTest!: RichTextResponse | null;
  contentfulRichTextTestEn = CONTENTFUL_RICHTEXT_TEST_DATA_EN;
  contentfulRichTextTestDe = CONTENTFUL_RICHTEXT_TEST_DATA_DE;

  lang: 'de' | 'en' = 'en';
  // data = ET_DUMMY_DATA_DOUBLE_16;

  structuredData: JsonLD.WithContext<JsonLD.Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ethlete',
    url: 'https://ethlete.io',
  };

  discoverMoviesQuery$ = discoverMovies.behaviorSubject();

  form = new FormControl({ value: true, disabled: false }, Validators.requiredTrue);

  cb1 = new FormControl(false);
  cb2 = new FormControl(false, Validators.requiredTrue);
  cb3 = new FormControl(false);
  cb5 = new FormControl(false);

  cb4 = new FormControl(false);

  radio1 = new FormControl('renault');

  textInput = new FormControl('foo');
  numberInput = new FormControl(0, [Validators.min(0), Validators.max(10), Validators.required]);

  renderLastRadio$ = of(false).pipe(
    delay(5000),
    map(() => true),
  );

  protected readonly routerStateService = inject(RouterStateService);

  constructor(
    private _viewportService: ViewportService,
    private _dialogService: DialogService,
    private _bottomSheetService: BottomSheetService,
  ) {
    this.routerStateService.enableScrollEnhancements({
      queryParamTriggerList: ['page'],
      fragment: { enabled: true, smooth: true },
    });

    this.seoDirective.updateConfig({
      title: 'foo',
      description: 'Sandbox app',
      alternate: [
        { href: 'foo', hreflang: 'bar' },
        { href: 'foo2', hreflang: 'bar2' },
      ],
    });

    this.contentfulRichTextTest = this.lang === 'de' ? this.contentfulRichTextTestDe : this.contentfulRichTextTestEn;
    // setTimeout(() => {
    //   this.seoDirective.updateConfig({ title: 'updated', description: 'Sandbox app 123' });
    // }, 5000);

    setTimeout(() => {
      this.form.setValue(false);
    }, 2500);

    this.cb4.valueChanges.pipe(startWith(this.cb4.value)).subscribe((v) => {
      if (v) {
        this.form.disable();
        this.cb1.disable();
        this.cb2.disable();
        this.cb3.disable();
        this.cb5.disable();
        this.radio1.disable();
      } else {
        this.form.enable();
        this.cb1.enable();
        this.cb2.enable();
        this.cb3.enable();
        this.cb5.enable();
        this.radio1.enable();
      }
    });
  }

  toggleRequired() {
    this.form.setValidators(this.form.validator === Validators.requiredTrue ? null : Validators.requiredTrue);
    this.form.updateValueAndValidity();
  }

  loadData() {
    this.discoverMoviesQuery$.next(
      discoverMovies
        .prepare({
          queryParams: {
            page: this.page++,
          },
        })
        .execute(),
    );
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'primary' ? 'accent' : 'primary';
  }

  updateText() {
    this.lang = this.lang === 'de' ? 'en' : 'de';
    this.contentfulRichTextTest = this.lang === 'de' ? this.contentfulRichTextTestDe : this.contentfulRichTextTestEn;
  }

  showDialog() {
    this._dialogService.open(DialogExampleComponent);
  }

  showBottomSheet() {
    this._bottomSheetService.open(BottomSheetExampleComponent);
  }
}
