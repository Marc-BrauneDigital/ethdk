import { inject, Injectable } from '@angular/core';
import { Data, NavigationEnd, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  pairwise,
} from 'rxjs';
import { equal } from '../utils';

export const routerDisableScrollTop = (config: { asReturnRoute?: boolean } = {}) => {
  if (!config.asReturnRoute) {
    return {
      disableScrollTop: true,
    };
  }

  return {
    disableScrollTopAsReturnRoute: true,
  };
};

@Injectable({
  providedIn: 'root',
})
export class RouterStateService {
  private _isScrollTopOnNavigationEnabled = false;
  private readonly _router = inject(Router);

  private readonly _route$ = new BehaviorSubject('/');

  private readonly _state$ = new BehaviorSubject<{
    data: Data;
    pathParams: Params;
    queryParams: Params;
    title: string | null;
    fragment: string | null;
  }>({
    title: null,
    fragment: null,
    data: {},
    pathParams: {},
    queryParams: {},
  });

  get route$() {
    return this._route$.asObservable();
  }

  get state$() {
    return this._state$.asObservable();
  }

  constructor() {
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        distinctUntilChanged((a, b) => a.url === b.url),
        map((event) => {
          const { url } = event;

          const urlWithoutQueryParams = url.split('?')[0];
          const withoutFragment = urlWithoutQueryParams.split('#')[0];

          return withoutFragment;
        }),
      )
      .subscribe(this._route$);

    this._route$
      .pipe(
        map(() => {
          let route = this._router.routerState.snapshot.root;

          while (route.firstChild) {
            route = route.firstChild;
          }

          const { data, params, queryParams, title, fragment } = route;

          return {
            data,
            pathParams: params,
            queryParams,
            title: title ?? null,
            fragment,
          };
        }),
      )
      .subscribe(this._state$);
  }

  enableScrollEnhancements(
    config: {
      scrollElement?: HTMLElement;
      queryParamTriggerList?: string[];
      fragment?: {
        enabled?: boolean;
        smooth?: boolean;
      };
    } = {},
  ) {
    if (this._isScrollTopOnNavigationEnabled) {
      return;
    }

    this._isScrollTopOnNavigationEnabled = true;

    combineLatest([this._state$.pipe(pairwise()), this._route$.pipe(pairwise())])
      .pipe(debounceTime(1))
      .subscribe(([[prevState, currState], [prevRoute, currRoute]]) => {
        const sameUrlNavigation = prevRoute === currRoute && equal(prevState.pathParams, currState.pathParams);
        const didFragmentChange = prevState.fragment !== currState.fragment;

        if (sameUrlNavigation) {
          const allQueryParams = [
            ...new Set(Object.keys(prevState.queryParams).concat(Object.keys(currState.queryParams))),
          ];

          const changedQueryParams = allQueryParams.filter(
            (key) => currState.queryParams[key] !== prevState.queryParams[key],
          );

          if (!config.queryParamTriggerList?.length && !didFragmentChange) {
            return;
          }

          const caseQueryParams = changedQueryParams.some((key) => config.queryParamTriggerList?.includes(key));
          const caseFragment = didFragmentChange && config.fragment?.enabled;

          if (caseQueryParams) {
            (config.scrollElement ?? document.documentElement).scrollTop = 0;
          } else if (caseFragment) {
            const fragmentElement = document.getElementById(currState.fragment ?? '');

            if (fragmentElement) {
              fragmentElement.scrollIntoView({ behavior: config.fragment?.smooth ? 'smooth' : 'auto' });
            }
          }
        } else {
          if (
            !(currState.data['disableScrollTopAsReturnRoute'] && prevState.data['disableScrollTop']) &&
            !currState.data['disableScrollTop']
          ) {
            (config.scrollElement ?? document.documentElement).scrollTop = 0;
          }
        }
      });
  }

  selectQueryParam<T = string | undefined>(key: string): Observable<T> {
    return this._state$.pipe(map((state) => state.queryParams[key]));
  }

  selectPathParam<T = string | undefined>(key: string): Observable<T> {
    return this._state$.pipe(map((state) => state.pathParams[key]));
  }

  selectData<T = unknown>(key: string): Observable<T> {
    return this._state$.pipe(map((state) => state.data[key]));
  }
}
