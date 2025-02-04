import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PaginationImports, SkeletonImports, Sort, SortImports, TableImports } from '@ethlete/components';
import { DestroyService, LetDirective, RepeatDirective } from '@ethlete/core';
import {
  createQueryCollection,
  filterQueryStates,
  QueryDirective,
  QueryField,
  QueryForm,
  QueryStateType,
  switchQueryState,
  transformToSort,
  transformToSortQueryParam,
} from '@ethlete/query';
import { takeUntil, tap } from 'rxjs';
import { discoverMovies, searchMovies } from './async-table.queries';

@Component({
  selector: 'ethlete-async-table',
  templateUrl: './async-table.component.html',
  styleUrls: ['./async-table.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    QueryDirective,
    AsyncPipe,
    JsonPipe,
    NgIf,
    ReactiveFormsModule,
    RepeatDirective,
    LetDirective,
    PaginationImports,
    SkeletonImports,
    SortImports,
    TableImports,
  ],
  providers: [DestroyService],
})
export class AsyncTableComponent implements OnInit, OnDestroy {
  private _destroy$ = inject(DestroyService, { host: true }).destroy$;

  discoverMoviesQuery$ = discoverMovies.behaviorSubject();

  collection$ = createQueryCollection({ discoverMovies, searchMovies });

  queryForm = new QueryForm({
    with_keywords: new QueryField({
      control: new FormControl(),
      debounce: 300,
    }),
    'vote_average.gte': new QueryField({
      control: new FormControl(7),
      debounce: 300,
    }),
    page: new QueryField({
      control: new FormControl(1),
    }),
    sort_by: new QueryField({
      control: new FormControl<Sort | null>(null),
      queryParamToValueTransformFn: transformToSort,
      valueToQueryParamTransformFn: transformToSortQueryParam,
    }),
  });

  ngOnInit(): void {
    setTimeout(() => {
      this.queryForm.setFormValueFromUrlQueryParams();
      this.queryForm
        .observe({ syncViaUrlQueryParams: true })
        .pipe(takeUntil(this._destroy$))
        .subscribe((value) =>
          this.discoverMoviesQuery$.next(
            discoverMovies
              .prepare({
                queryParams: {
                  'vote_average.gte': value['vote_average.gte'] ?? undefined,
                  sort_by:
                    value.sort_by?.active && value.sort_by?.direction
                      ? `${value.sort_by?.active}.${value.sort_by?.direction}`
                      : undefined,
                  with_keywords: value.with_keywords,
                },
              })
              .execute(),
          ),
        );
      this.queryForm.updateFormOnUrlQueryParamsChange().pipe(takeUntil(this._destroy$)).subscribe();
    }, 1);

    this.discoverMoviesQuery$
      .pipe(
        switchQueryState(),
        filterQueryStates([QueryStateType.Loading, QueryStateType.Success]),
        // filterSuccess(),
        tap((v) => console.log(v)),
        takeUntil(this._destroy$),
      )
      .subscribe();

    // const getRegistration = discoverMovies.prepare({ queryParams: { page: 3 } }).execute();

    // getRegistration.state$.pipe(filterSuccess()).subscribe((v) => console.log(v.meta.id, { page: v.rawResponse.page }));

    // const cancelRegistration = () => {
    //   discoverMovies
    //     .prepare({
    //       queryParams: { page: 1 },
    //       useResultIn: [getRegistration],
    //     })
    //     .execute();
    //   discoverMovies.prepare({ queryParams: { page: 2 }, useResultIn: [getRegistration] }).execute();

    //   // discoverMovies.prepare({ queryParams: { page: 1 }, useResultIn: [getRegistration] }).execute();
    //   // discoverMovies.prepare({ queryParams: { page: 1 }, useResultIn: [getRegistration] }).execute();
    //   // discoverMovies.prepare({ queryParams: { page: 5 }, useResultIn: [getRegistration] }).execute();
    // };

    // cancelRegistration();
  }

  ngOnDestroy(): void {
    console.log('destroyed');
  }
}
