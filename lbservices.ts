/* tslint:disable */
import {Injectable, Inject, Optional} from 'angular2/core';
import {Http, Headers, Request, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';

export interface LoopBackFilterInterface {
  fields?: any;
  include?: any;
  limit?: any;
  order?: any;
  skip?: any;
  offset?: any;
  where?: any;
}

class LoopBackAuth {
  protected accessTokenId: any;
  protected currentUserId: any;
  protected rememberMe: boolean;
  protected currentUserData: any;

  protected propsPrefix: string = '$LoopBack$';

  constructor() {
    this.accessTokenId = this.load("accessTokenId");
    this.currentUserId = this.load("currentUserId");
    this.rememberMe = this.load("rememberMe");
    this.currentUserData = null;
  }

  public setRememberMe(value: boolean): LoopBackAuth {
    this.rememberMe = value;
    return this;
  }

  public getCurrentUserId(): any {
    return this.currentUserId;
  }

  public setCurrentUserData(data: any): LoopBackAuth {
    this.currentUserData = data;
    return this;
  }

  public getCurrentUserData(): any {
    return this.currentUserData;
  }

  public getAccessTokenId(): any {
    return this.accessTokenId;
  }

  public save() {
    var storage = this.rememberMe ? localStorage : sessionStorage;
    this.saveThis(storage, "accessTokenId", this.accessTokenId);
    this.saveThis(storage, "currentUserId", this.currentUserId);
    this.saveThis(storage, "rememberMe", this.rememberMe);
  };

  public setUser(accessTokenId: any, userId: any, userData: any) {
    this.accessTokenId = accessTokenId;
    this.currentUserId = userId;
    this.currentUserData = userData;
  }

  public clearUser() {
    this.accessTokenId = null;
    this.currentUserId = null;
    this.currentUserData = null;
  }

  public clearStorage() {
    this.saveThis(sessionStorage, "accessTokenId", null);
    this.saveThis(localStorage, "accessTokenId", null);
    this.saveThis(sessionStorage, "currentUserId", null);
    this.saveThis(localStorage, "currentUserId", null);
    this.saveThis(sessionStorage, "rememberMe", null);
    this.saveThis(localStorage, "rememberMe", null);
  };

  // Note: LocalStorage converts the value to string
  // We are using empty string as a marker for null/undefined values.
  protected saveThis(storage: any, name: string, value: any) {
    try {
      var key = this.propsPrefix + name;
      if (value == null) {
        value = '';
      }
      storage[key] = value;
    }
    catch(err) {
      console.log('Cannot access local/session storage:', err);
    }
  }

  protected load(name: string): any {
    var key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }
}

let auth = new LoopBackAuth();


/**
 * Default error handler
 */
export class ErrorHandler {
  public handleError(error: Response) {
    return Observable.throw(error.json().error || 'Server error');
  }
}


@Injectable()
export abstract class BaseLoopBackApi {

  protected path: string;

  constructor(
    @Inject(Http) protected http: Http, 
    @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
  ) {
    if (!errorHandler) {
      this.errorHandler = new ErrorHandler();
    }
    this.init();
  }

  /**
   * Get path for building part of URL for API
   * @return string
   */
  protected getPath(): string {
    return this.path;
  }

  protected init() {
    this.path = "/api";
  }

  /**
   * Process request
   * @param string  method    Request method (GET, POST, PUT)
   * @param string  url       Request url (my-host/my-url/:id)
   * @param any     urlParams Values of url parameters
   * @param any     params    Parameters for building url (filter and other)
   * @param any     data      Request body
   */
  public request(method: string, url: string, urlParams: any = {}, 
                 params: any = {}, data: any = null) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (auth.getAccessTokenId()) {
      headers.append('Authorization', auth.getAccessTokenId());
    }

    let requestUrl = url;
    let key: string;
    for (key in urlParams) {
      requestUrl = requestUrl.replace(new RegExp(":" + key + "(\/|$)", "g"), urlParams[key] + "$1");
    }

    let parameters: string[] = [];
    for (var param in params) {
      parameters.push(param + '=' + (typeof params[param] === 'object' ? JSON.stringify(params[param]) : params[param]));
    }
    requestUrl += (parameters ? '?' : '') + parameters.join('&');

    let request = new Request({
      headers: headers,
      method: method,
      url: requestUrl,
      body: data ? JSON.stringify(data) : undefined
    });

    return this.http.request(request)
      .map(res => (res.text() != "" ? res.json() : {}))
      .catch(this.errorHandler.handleError);
  }
}


/**
 * Api for the `User` model.
 */
@Injectable()
export class UserApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __findById__accessTokens(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__accessTokens(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __updateById__accessTokens(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries accessTokens of User.
   *
   * @param any id User id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __get__accessTokens(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in accessTokens of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __create__accessTokens(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all accessTokens of this model.
   *
   * @param any id User id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__accessTokens(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts accessTokens of User.
   *
   * @param any id User id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__accessTokens(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Login a user with username/email and password.
   *
   * @param string include Related objects to include in the response. See the description of return value for more details.
   *   Default value: `user`.
   *
   *  - `rememberMe` - `boolean` - Whether the authentication credentials
   *     should be remembered in localStorage across app/browser restarts.
   *     Default: `true`.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The response body contains properties of the AccessToken created on login.
   * Depending on the value of `include` parameter, the body may contain additional properties:
   * 
   *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
   * 
   *
   */
  public login(credentials: any, include: any = "user") {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/login";
    let urlParams: any = {
    };

    let params: any = {};
    if (include !== undefined) {
      params.include = include;
    }

    let result = this.request(method, url, urlParams, params, credentials)
      .share();
      result.subscribe(
        response => {
          auth.setUser(response.id, response.userId, response.user);
          auth.setRememberMe(true);
          auth.save();
        },
        () => null
      );
    return result;
  }

  /**
   * Logout a user with access token.
   *
   * @param object data Request data.
   *
   *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public logout() {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/logout";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params)
      .share();
      result.subscribe(
        () => {
          auth.clearUser();
          auth.clearStorage();
        },
        () => null
      );
    return result;
  }

  /**
   * Confirm a user registration with email verification token.
   *
   * @param string uid 
   *
   * @param string token 
   *
   * @param string redirect 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public confirm(uid: string, token: string, redirect: string = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/confirm";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Reset password for a user with email.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public resetPassword(options: any) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/reset";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * @ngdoc method
   * @name lbServices.User#getCurrent
   * @methodOf lbServices.User
   *
   * @description
   *
   * Get data of the currently logged user. Fail with HTTP result 401
   * when there is no user logged in.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   */
  public getCurrent(): any {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users" + "/:id";
    let id: any = auth.getCurrentUserId();
    if (id == null) {
      id = '__anonymous__';
    }
    let urlParams: any = {
      id: id
    };

    let result = this.request(method, url, urlParams)
      .share();
      result.subscribe(
        response => {
          auth.setCurrentUserData(response);
        },
        () => null
      );
    return result;
  }

  /**
   * Get data of the currently logged user that was returned by the last
   * call to {@link lbServices.User#login} or
   * {@link lbServices.User#getCurrent}. Return null when there
   * is no user logged in or the data of the current user were not fetched
   * yet.
   *
   * @returns object A User instance.
   */
  public getCachedCurrent() {
    return auth.getCurrentUserData();
  }

  /**
   * @name lbServices.User#isAuthenticated
   *
   * @returns {boolean} True if the current user is authenticated (logged in).
   */
  public isAuthenticated() {
    return this.getCurrentId() != null;
  }

  /**
   * @name lbServices.User#getCurrentId
   *
   * @returns object Id of the currently logged-in user or null.
   */
  public getCurrentId() {
    return auth.getCurrentUserId();
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `User`.
   */
  public getModelName() {
    return "User";
  }
}

/**
 * Api for the `CBookingTypes` model.
 */
@Injectable()
export class CBookingTypesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __findById__CClinicBookingTypes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CClinicBookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __updateById__CClinicBookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __findById__Clinics(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __updateById__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __link__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __exists__Clinics(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries CClinicBookingTypes of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __get__CClinicBookingTypes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in CClinicBookingTypes of this model.
   *
   * @param any id BookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __create__CClinicBookingTypes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all CClinicBookingTypes of this model.
   *
   * @param any id BookingTypes id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CClinicBookingTypes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts CClinicBookingTypes of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CClinicBookingTypes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __get__Clinics(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id BookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __create__Clinics(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id BookingTypes id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/Clinics/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id BookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Fetches belongsTo relation BookingTypes.
   *
   * @param any id ClinicBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __get__CClinicBookingTypes__BookingTypes(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation BookingTypes.
   *
   * @param any id DoctorBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CBookingTypes` object.)
   * </em>
   */
  public __get__CDoctorBookingTypes__BookingTypes(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CBookingTypes`.
   */
  public getModelName() {
    return "CBookingTypes";
  }
}

/**
 * Api for the `CClinicBookingTypes` model.
 */
@Injectable()
export class CClinicBookingTypesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation BookingTypes.
   *
   * @param any id ClinicBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __get__BookingTypes(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Clinics.
   *
   * @param any id ClinicBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __get__Clinics(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinicBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinicBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinicBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinicBookingTypes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id ClinicBookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinicBookingTypes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __findById__CBookingTypes__CClinicBookingTypes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CBookingTypes__CClinicBookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for CClinicBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __updateById__CBookingTypes__CClinicBookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries CClinicBookingTypes of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __get__CBookingTypes__CClinicBookingTypes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in CClinicBookingTypes of this model.
   *
   * @param any id BookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __create__CBookingTypes__CClinicBookingTypes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in CClinicBookingTypes of this model.
   *
   * @param any id BookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinicBookingTypes` object.)
   * </em>
   */
  public __createMany__CBookingTypes__CClinicBookingTypes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all CClinicBookingTypes of this model.
   *
   * @param any id BookingTypes id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CBookingTypes__CClinicBookingTypes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts CClinicBookingTypes of CBookingTypes.
   *
   * @param any id BookingTypes id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CBookingTypes__CClinicBookingTypes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CBookingTypes/:id/CClinicBookingTypes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CClinicBookingTypes`.
   */
  public getModelName() {
    return "CClinicBookingTypes";
  }
}

/**
 * Api for the `CDoctorBookingTypes` model.
 */
@Injectable()
export class CDoctorBookingTypesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation BookingTypes.
   *
   * @param any id DoctorBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public __get__BookingTypes(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Doctors.
   *
   * @param any id DoctorBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public __get__Doctors(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctorBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorBookingTypes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id DoctorBookingTypes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorBookingTypes` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorBookingTypes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CDoctorBookingTypes`.
   */
  public getModelName() {
    return "CDoctorBookingTypes";
  }
}

/**
 * Api for the `CDoctorClinics` model.
 */
@Injectable()
export class CDoctorClinicsApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation Doctors.
   *
   * @param any id DoctorClinics id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public __get__Doctors(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Clinics.
   *
   * @param any id DoctorClinics id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public __get__Clinics(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctorClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorClinics/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctorClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id DoctorClinics id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctorClinics` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctorClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctorClinics/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CDoctorClinics`.
   */
  public getModelName() {
    return "CDoctorClinics";
  }
}

/**
 * Api for the `CDoctors` model.
 */
@Injectable()
export class CDoctorsApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__BookingTypes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__BookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __link__BookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__BookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __exists__BookingTypes(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Person.
   *
   * @param any id Doctors id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__Person(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Person";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__People(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__People(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__People(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__Rosters(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Rosters(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__Rosters(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__Clinics(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __link__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __exists__Clinics(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__BookingTypes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__BookingTypes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries People of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__People(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in People of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__People(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all People of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__People(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts People of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__People(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Rosters of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__Rosters(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Rosters of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__Rosters(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Rosters of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Rosters(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Rosters of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Rosters(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__Clinics(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__Clinics(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__Clinics__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __link__Clinics__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __exists__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for Doctors.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Doctors.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Doctors.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__Clinics__Doctors(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Doctors.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __link__Clinics__Doctors(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Doctors relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Doctors relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __exists__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CClinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__Clinics__BookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__Clinics__BookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics__BookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CClinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics__BookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/BookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Doctors of CClinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__Clinics__Doctors(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__Clinics__Doctors(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Doctors of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics__Doctors(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Doctors of CClinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics__Doctors(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Clinics/:nk/Doctors/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for CClinicBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for CClinicBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for CClinicBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__BookingTypes__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __link__BookingTypes__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __exists__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries CClinicBookingTypes of CBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__BookingTypes__CClinicBookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in CClinicBookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__BookingTypes__CClinicBookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all CClinicBookingTypes of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes__CClinicBookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts CClinicBookingTypes of CBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes__CClinicBookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/CClinicBookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CBookingTypes.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__BookingTypes__Clinics(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__BookingTypes__Clinics(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Doctors id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes__Clinics(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CBookingTypes.
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes__Clinics(nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/BookingTypes/:nk/Clinics/count";
    let urlParams: any = {
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Doctors.
   *
   * @param any id DoctorBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__CDoctorBookingTypes__Doctors(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorBookingTypes/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Doctors.
   *
   * @param any id DoctorClinics id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__CDoctorClinics__Doctors(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __findById__CCompanies__Doctors(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CCompanies__Doctors(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __updateById__CCompanies__Doctors(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries Doctors of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __get__CCompanies__Doctors(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __create__CCompanies__Doctors(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CDoctors` object.)
   * </em>
   */
  public __createMany__CCompanies__Doctors(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Doctors of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CCompanies__Doctors(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Doctors of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CCompanies__Doctors(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CDoctors`.
   */
  public getModelName() {
    return "CDoctors";
  }
}

/**
 * Api for the `CGallery` model.
 */
@Injectable()
export class CGalleryApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CGalleries";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CGalleries";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CGalleries";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CGalleries/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CGalleries/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CGalleries";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CGalleries/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CGalleries/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CGalleries/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CGalleries/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Gallery id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CGalleries/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CGalleries/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public __findById__CCompanies__Galleries(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CCompanies__Galleries(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public __updateById__CCompanies__Galleries(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries Galleries of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public __get__CCompanies__Galleries(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Galleries of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public __create__CCompanies__Galleries(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in Galleries of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CGallery` object.)
   * </em>
   */
  public __createMany__CCompanies__Galleries(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Galleries of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CCompanies__Galleries(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Galleries of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CCompanies__Galleries(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CGallery`.
   */
  public getModelName() {
    return "CGallery";
  }
}

/**
 * Api for the `CPeople` model.
 */
@Injectable()
export class CPeopleApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CPeople";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CPeople";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CPeople";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CPeople/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CPeople/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CPeople";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CPeople/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CPeople/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CPeople/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CPeople/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id People id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CPeople/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CPeople/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Fetches belongsTo relation Person.
   *
   * @param any id Doctors id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __get__CDoctors__Person(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Person";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __findById__CDoctors__People(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CDoctors__People(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for People.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for People
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __updateById__CDoctors__People(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/People/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries People of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __get__CDoctors__People(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in People of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __create__CDoctors__People(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in People of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CPeople` object.)
   * </em>
   */
  public __createMany__CDoctors__People(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all People of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CDoctors__People(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/People";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts People of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CDoctors__People(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/People/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CPeople`.
   */
  public getModelName() {
    return "CPeople";
  }
}

/**
 * Api for the `CRosters` model.
 */
@Injectable()
export class CRostersApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosters";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosters";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosters";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosters/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosters/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosters";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosters/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosters/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CRosters/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosters/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Rosters id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosters/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosters/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param object data Request data.
   *
   *  - `msg` – `{string}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `greeting` – `{string}` - 
   */
  public greet(msg: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosters/greet";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, msg);
    return result;
  }

  /**
   * Find a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public __findById__CDoctors__Rosters(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CDoctors__Rosters(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Rosters.
   *
   * @param any id Doctors id
   *
   * @param any fk Foreign key for Rosters
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public __updateById__CDoctors__Rosters(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries Rosters of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public __get__CDoctors__Rosters(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Rosters of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public __create__CDoctors__Rosters(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in Rosters of this model.
   *
   * @param any id Doctors id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosters` object.)
   * </em>
   */
  public __createMany__CDoctors__Rosters(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Rosters of this model.
   *
   * @param any id Doctors id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CDoctors__Rosters(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Rosters of CDoctors.
   *
   * @param any id Doctors id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CDoctors__Rosters(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctors/:id/Rosters/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CRosters`.
   */
  public getModelName() {
    return "CRosters";
  }
}

/**
 * Api for the `CRosterDays` model.
 */
@Injectable()
export class CRosterDaysApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterDays";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterDays";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterDays";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterDays/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterDays/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterDays";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterDays/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterDays/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CRosterDays/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterDays/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id RosterDays id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterDays` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterDays/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterDays/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CRosterDays`.
   */
  public getModelName() {
    return "CRosterDays";
  }
}

/**
 * Api for the `CRosterPlaces` model.
 */
@Injectable()
export class CRosterPlacesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterPlaces";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterPlaces";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterPlaces";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterPlaces/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterPlaces/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterPlaces";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterPlaces/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterPlaces/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CRosterPlaces/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterPlaces/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id RosterPlaces id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterPlaces` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterPlaces/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterPlaces/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CRosterPlaces`.
   */
  public getModelName() {
    return "CRosterPlaces";
  }
}

/**
 * Api for the `CReviews` model.
 */
@Injectable()
export class CReviewsApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CReviews";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CReviews";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CReviews";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CReviews/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CReviews/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CReviews";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CReviews/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CReviews/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CReviews/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CReviews/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Reviews id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CReviews` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CReviews/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CReviews/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CReviews`.
   */
  public getModelName() {
    return "CReviews";
  }
}

/**
 * Api for the `CRosterTimes` model.
 */
@Injectable()
export class CRosterTimesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterTimes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterTimes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterTimes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterTimes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterTimes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterTimes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterTimes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterTimes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CRosterTimes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CRosterTimes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id RosterTimes id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CRosterTimes` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CRosterTimes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CRosterTimes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CRosterTimes`.
   */
  public getModelName() {
    return "CRosterTimes";
  }
}

/**
 * Api for the `CClinics` model.
 */
@Injectable()
export class CClinicsApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__BookingTypes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__BookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __link__BookingTypes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__BookingTypes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __exists__BookingTypes(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for Doctors.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__Doctors(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Doctors.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Doctors.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__Doctors(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Doctors.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __link__Doctors(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Doctors relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Doctors(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Doctors relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __exists__Doctors(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CClinics.
   *
   * @param any id Clinics id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__BookingTypes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__BookingTypes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CClinics.
   *
   * @param any id Clinics id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Doctors of CClinics.
   *
   * @param any id Clinics id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Clinics id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__Doctors(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Doctors of this model.
   *
   * @param any id Clinics id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Doctors of CClinics.
   *
   * @param any id Clinics id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Clinics id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for CClinicBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for CClinicBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for CClinicBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for CClinicBookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__BookingTypes__CClinicBookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__BookingTypes__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __link__BookingTypes__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __exists__BookingTypes__Clinics(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries CClinicBookingTypes of CBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__BookingTypes__CClinicBookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in CClinicBookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__BookingTypes__CClinicBookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all CClinicBookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes__CClinicBookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts CClinicBookingTypes of CBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes__CClinicBookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/CClinicBookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__BookingTypes__Clinics(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__BookingTypes__Clinics(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__BookingTypes__Clinics(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CBookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for BookingTypes.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__BookingTypes__Clinics(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/BookingTypes/:nk/Clinics/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__Doctors__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __link__Doctors__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __exists__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Person.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors__Person(id: any, nk: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Person";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for People.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__Doctors__People(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for People.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__People(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for People.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__Doctors__People(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Rosters.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__Doctors__Rosters(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Rosters.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__Rosters(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Rosters.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__Doctors__Rosters(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__Doctors__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __link__Doctors__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __exists__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors__BookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__Doctors__BookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__BookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__BookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/BookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries People of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors__People(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in People of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__Doctors__People(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all People of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__People(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts People of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__People(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/People/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Rosters of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors__Rosters(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Rosters of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__Doctors__Rosters(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Rosters of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__Rosters(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Rosters of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__Rosters(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Rosters/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CDoctors.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__Doctors__Clinics(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__Doctors__Clinics(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Clinics id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__Clinics(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CDoctors.
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__Clinics(nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinics/:id/Doctors/:nk/Clinics/count";
    let urlParams: any = {
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Clinics.
   *
   * @param any id ClinicBookingTypes id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__CClinicBookingTypes__Clinics(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CClinicBookingTypes/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Clinics.
   *
   * @param any id DoctorClinics id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__CDoctorClinics__Clinics(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CDoctorClinics/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __findById__CCompanies__Clinics(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__CCompanies__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __updateById__CCompanies__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries Clinics of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __get__CCompanies__Clinics(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __create__CCompanies__Clinics(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CClinics` object.)
   * </em>
   */
  public __createMany__CCompanies__Clinics(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__CCompanies__Clinics(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__CCompanies__Clinics(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CClinics`.
   */
  public getModelName() {
    return "CClinics";
  }
}

/**
 * Api for the `CCompanies` model.
 */
@Injectable()
export class CCompaniesApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Clinics(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Clinics(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Galleries(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Galleries(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Galleries.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Galleries
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Galleries(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Doctors(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Doctors(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries Clinics of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Clinics(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Clinics(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Galleries of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Galleries(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Galleries of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Galleries(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Galleries of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Galleries(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Galleries of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Galleries(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Galleries/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Doctors of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Doctors(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Doctors of this model.
   *
   * @param any id Companies id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Doctors of CCompanies.
   *
   * @param any id Companies id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id Companies id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Clinics__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __link__Clinics__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __exists__Clinics__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Clinics__Doctors(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Doctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __link__Clinics__Doctors(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Doctors relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Doctors relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param any fk Foreign key for Doctors
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __exists__Clinics__Doctors(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CClinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Clinics__BookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Clinics__BookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics__BookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CClinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics__BookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/BookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Doctors of CClinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Clinics__Doctors(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Doctors of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Clinics__Doctors(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Doctors of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Clinics__Doctors(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Doctors of CClinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Clinics.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Clinics__Doctors(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Clinics/:nk/Doctors/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Doctors__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for BookingTypes.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __link__Doctors__BookingTypes(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the BookingTypes relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of BookingTypes relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for BookingTypes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __exists__Doctors__BookingTypes(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation Person.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors__Person(id: any, nk: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Person";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for People.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Doctors__People(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for People.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__People(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for People.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for People
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Doctors__People(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Rosters.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Doctors__Rosters(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Rosters.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__Rosters(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Rosters.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Rosters
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Doctors__Rosters(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Find a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __findById__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __updateById__Doctors__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for Clinics.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __link__Doctors__Clinics(id: any, nk: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the Clinics relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of Clinics relation to an item by id.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param any fk Foreign key for Clinics
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __exists__Doctors__Clinics(id: any, nk: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/rel/:fk";
    let urlParams: any = {
      id: id,
      nk: nk,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries BookingTypes of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors__BookingTypes(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in BookingTypes of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Doctors__BookingTypes(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all BookingTypes of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__BookingTypes(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts BookingTypes of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__BookingTypes(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/BookingTypes/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries People of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors__People(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in People of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Doctors__People(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all People of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__People(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts People of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__People(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/People/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Rosters of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors__Rosters(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Rosters of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Doctors__Rosters(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Rosters of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__Rosters(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Rosters of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__Rosters(id: any, nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Rosters/count";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries Clinics of CDoctors.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __get__Doctors__Clinics(id: any, nk: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in Clinics of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CCompanies` object.)
   * </em>
   */
  public __create__Doctors__Clinics(id: any, nk: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all Clinics of this model.
   *
   * @param any id Companies id
   *
   * @param any nk Foreign key for Doctors.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__Doctors__Clinics(id: any, nk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics";
    let urlParams: any = {
      id: id,
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts Clinics of CDoctors.
   *
   * @param any nk Foreign key for Doctors.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__Doctors__Clinics(nk: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/CCompanies/:id/Doctors/:nk/Clinics/count";
    let urlParams: any = {
      nk: nk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `CCompanies`.
   */
  public getModelName() {
    return "CCompanies";
  }
}



