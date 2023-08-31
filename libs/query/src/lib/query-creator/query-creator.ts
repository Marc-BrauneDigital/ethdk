import { EntityStore } from '../entity';
import { Query, computeQueryQueryParams, isGqlQueryConfig } from '../query';
import { QueryClient, buildGqlCacheKey, shouldCacheQuery } from '../query-client';
import { QueryStore } from '../query-store';
import { BaseArguments, GqlQueryConfig, RestQueryConfig, RouteType, WithHeaders } from '../query/query.types';
import { buildRoute } from '../request';
import { QueryContainerConfig, QuerySubject, querySignal } from '../utils';
import { QueryPrepareFn } from './query-creator.types';

export class QueryCreator<
  Arguments extends BaseArguments | undefined,
  Response,
  Route extends RouteType<Arguments>,
  Store extends EntityStore<unknown>,
  Data,
  Id,
> {
  constructor(
    private _queryConfig:
      | RestQueryConfig<Route, Response, Arguments, Store, Data, Id>
      | GqlQueryConfig<Route, Response, Arguments, Store, Data, Id>,
    private _client: QueryClient,
    private _store: QueryStore,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  prepare: QueryPrepareFn<Arguments, Response, Route, Store, Data, Id> = (args?: Arguments & WithHeaders) => {
    const route = buildRoute({
      base: this._client.config.baseRoute,
      route: this._queryConfig.route,
      pathParams: args?.pathParams,
      queryParams: computeQueryQueryParams({ config: this._queryConfig, client: this._client, args }),
      queryParamConfig: this._client.config.request?.queryParams,
    }) as Route;

    const cacheKey = isGqlQueryConfig(this._queryConfig) ? buildGqlCacheKey(this._queryConfig, args) : route;

    if (shouldCacheQuery(this._queryConfig.method)) {
      const existingQuery = this._store.get<Query<Response, Arguments, Route, Store, Data, Id>>(cacheKey);

      if (existingQuery) {
        return existingQuery;
      }
    }

    const query = new Query<Response, Arguments, Route, Store, Data, Id>(
      this._client,
      this._queryConfig,
      route,
      args ?? ({} as Arguments),
    );

    if (shouldCacheQuery(this._queryConfig.method)) {
      this._store.add(cacheKey, query);
    }

    this._store._dispatchQueryCreated(query);

    return query;
  };

  querySubject = (initialValue?: ReturnType<typeof this.prepare> | null, config?: QueryContainerConfig) =>
    new QuerySubject<ReturnType<typeof this.prepare> | null>(initialValue ?? null, config);

  querySignal = (initialValue?: ReturnType<typeof this.prepare> | null, config?: QueryContainerConfig) =>
    querySignal<ReturnType<typeof this.prepare> | null>(initialValue ?? null, config);

  /**
   * @deprecated Use `querySubject()` instead. Will be removed in v5.
   */
  behaviorSubject = (initialValue?: ReturnType<typeof this.prepare> | null, config?: QueryContainerConfig) =>
    new QuerySubject<ReturnType<typeof this.prepare> | null>(initialValue ?? null, config);
}
