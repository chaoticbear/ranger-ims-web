import jwtDecode from "jsonwebtoken/decode";
import moment from "moment";

import User from "./User";
import CredentialStore from "./store/CredentialStore";


export default class IncidentManagementSystem {

  static _credentialStoreKey = "org.burningman.rangers.ims.credentials";

  constructor(bagURL) {
    if (! bagURL) {
      throw new Error("bagURL is required");
    }

    Object.defineProperty(this, "user", {
      enumerable: true,
      get: () => {
        if (this._user === undefined) {
          this._user = this._credentialStore.loadCredentials();
        }
        return this._user;
      },
      set: (user) => {
        this._user = user;
        if (user === null) {
          this._credentialStore.removeCredentials();
        }
        else {
          this._credentialStore.storeCredentials(user);
        }
        if (this.delegate !== null) {
          this.delegate();
        }
      },
    });

    this.bagURL = bagURL;
    this.delegate = null;
    this._credentialStore = new CredentialStore(this._credentialStoreKey);
    this._bag = null;
  }

  _fetch = async (request) => {
    let authenticated;
    if (this.isLoggedIn()) {
      authenticated = true;
      request.headers.set(
        "Authorization", `Bearer ${this.user.credentials.token}`
      );
    }
    else {
      authenticated = false;
    }

    console.log(
      `Issuing ${authenticated ? "authenticated" : "unauthenticated"} ` +
      `request: ${request.method} ${request.url}`
    );
    const response = await fetch(request);

    if (! response.ok) {
      if (response.status === 401) {
        if (authenticated) {
          console.log(`Authentication failed for resource: ${request.url}`);
          await this.logout();
        }
        else {
          console.log(`Authentication required for resource: ${request.url}`);
        }
      }
      else {
        console.log(
          "Non-OK response from server " +
          `(${response.status}: ${response.statusText})`
        );
      }
    }

    return response;
  }

  _fetchJSON = async (url, json=null, headers={}) => {
    const requestHeaders = new Headers(headers);

    // Ensure content type is JSON
    if (requestHeaders.has("Content-Type")) {
      const contentType = requestHeaders.get("Content-Type");
      if (contentType !== "application/json") {
        throw new Error(`Not JSON content-type: ${contentType}`);
      }
    }
    else {
      requestHeaders.set("Content-Type", "application/json");
    }

    const requestOptions = { headers: requestHeaders };
    if (json == null) {
      requestOptions.method = "GET";
    }
    else {
      requestOptions.method = "POST";
      requestOptions.body = JSON.stringify(json);;
    }

    const request = new Request(url, requestOptions);
    const response = await this._fetch(request);

    if (response.ok) {
      const responseContentType = response.headers.get("Content-Type");
      if (responseContentType !== "application/json") {
        throw new Error(`Response type is not JSON: ${responseContentType}`);
      }
    }

    return response;
  }

  ////
  //  Configuration
  ////

  bag = async () => {
    if (this._bag !== null) {
      return this._bag;
    }
    else {
      console.log("Retrieving bag from IMS server...");

      const response = await this._fetchJSON(this.bagURL);
      if (! response.ok) {
        throw new Error("Failed to retrieve bag.");
      }
      const bag = await response.json();

      if (bag.urls == null) {
        throw new Error(`Bag does not have URLs: ${bag}`);
      }

      this._bag = bag;
    }
    return this._bag;
  }

  ////
  //  Authentication
  ////

  login = async (username, credentials) => {
    if (username == null) {
      throw new Error("username is required")
    }
    if (credentials == null) {
      throw new Error("credentials is required")
    }
    if (credentials.password == null) {
      throw new Error("password is required")
    }

    const bag = await this.bag();

    console.log(`Authenticating to IMS server as ${username}...`);

    const requestJSON = {
      identification: username, password: credentials.password
    };
    const response = await this._fetchJSON(
      bag.urls.auth, requestJSON, {}, true
    );

    // Authentication failure yields a 401 response with a JSON error.
    let failureReason;
    if (response.status === 401) {
      let responseJSON;
      try {
        responseJSON = await response.json();
      }
      catch (e) {
        responseJSON = null;
      }

      if (responseJSON === null) {
        failureReason = "non-JSON response for login";
      }
      else {
        if (responseJSON.status === "invalid-credentials") {
          console.log(`Credentials for ${username} are invalid.`);
          return false;
        }
        failureReason = `unknown JSON error status: ${responseJSON.status}`;
      }
    }
    else {
      failureReason = (
        `HTTP error status ${response.status} ${response.statusText}`
      );
    }

    if (! response.ok) {
      throw new Error(`Failed to authenticate: ${failureReason}`);
    }

    const responseJSON = await response.json();
    const token = responseJSON.token;

    if (token == null) {
      throw new Error("No token in retrieved credentials");
    }

    const jwt = jwtDecode(token);

    // Available but unused claims:
    // const personID = jwt.sub;
    // const issuer = jwt.iss;
    // const issued = moment.unix(jwt.iat);

    // Use username preferred by the IMS server
    const preferredUsername = jwt.preferred_username;
    if (preferredUsername != null && preferredUsername !== username) {
      console.log(
        "Using preferred username in retrieved credentials " +
        `(${preferredUsername}), ` +
        `which differs from submitted username (${username})`
      );
      username = preferredUsername;
    }

    if (jwt.exp == null) {
      throw new Error("No expiration in retrieved credentials");
    }
    const expiration = moment.unix(jwt.exp);

    const imsCredentials = { token: token, expiration: expiration };

    this.user = new User(username, imsCredentials);

    console.log(
      `Logged in as ${this.user} until ${expiration.toISOString()}.`
    );

    return true;
  }

  logout = async () => {
    console.log(`Logging out as ${this.user}...`);
    // FIXME: this should tell the server that the token we are using is no
    // longer needed.
    this.user = null;
    return true;
  }

  /*
   * Determine whether we have a user with non-expired credentials.
   */
  isLoggedIn = () => {
    const user = this.user;
    if (user === null) {
      return false;
    }

    return moment().isBefore(user.credentials.expiration);
  }

  ////
  //  Data
  ////

  events = async () => {
    const bag = await this.bag();
    const response = await this._fetchJSON(bag.urls.events);
    if (! response.ok) {
      throw new Error("Failed to retrieve events.");
    }
    const events = await response.json();
    return events;
  }

}
