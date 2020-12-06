import moment from "moment";

import { Authenticator, TestAuthentationSource, User } from "./auth";


describe("User", () => {

  test("username is required", () => {
    const message = "username is required";

    expect(() => {new User()}).toThrow(message);
    expect(() => {new User(undefined, {})}).toThrow(message);
    expect(() => {new User(null, {})}).toThrow(message);
  });

  test("credentials is required", () => {
    const username = "Cheese Butter";
    const message = "credentials is required";

    expect(() => {new User(username)}).toThrow(message);
    expect(() => {new User(username, undefined)}).toThrow(message);
    expect(() => {new User(username, null)}).toThrow(message);
  });

  test("credentials.expiration is required", () => {
    const username = "Cheese Butter";
    const message = "credentials.expiration is required";

    expect(() => {new User(username, {})}).toThrow(message);
  });

  test("toJSON", () => {
    const username = "Cheese Butter";
    const credentials = {
      number: 1,
      text: "text",
      array: [1, 2, 3],
      dict: {a: 1},
      expiration: moment(),
    };
    const user = new User(username, credentials);
    const userJSON = {username: username, credentials: credentials};
    const result = user.toJSON();

    expect(result).toEqual(userJSON);
  });

  test("fromJSON", () => {
    const username = "Cheese Butter";
    const credentials = {
      number: 1,
      text: "text",
      array: [1, 2, 3],
      dict: {a: 1},
      expiration: moment(),
    };
    const user = new User(username, credentials);
    const userJSON = user.toJSON();
    const result = User.fromJSON(userJSON);
    const resultJSON = result.toJSON();

    expect(resultJSON).toEqual(userJSON);
  });

  test("JSON round-trip through text", () => {
    const username = "Cheese Butter";
    const credentials = {
      number: 1,
      text: "text",
      array: [1, 2, 3],
      dict: {a: 1},
      expiration: moment(),
    };
    const user = new User(username, credentials);
    const userJSONText = JSON.stringify(user.toJSON());
    const result = User.fromJSON(JSON.parse(userJSONText));
    const resultJSON = result.toJSON();

    expect(JSON.stringify(resultJSON)).toEqual(userJSONText);
  });

});


describe("TestAuthentationSource", () => {

  test("valid login -> user", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const user = await source.login(username, {password: password});

    expect(user).not.toBeNull();
    expect(user.username).toEqual(username);
  });

  test("valid login -> expiration", async () => {
    const username = "user";
    const password = username;
    const now = moment();
    const source = new TestAuthentationSource();
    const user = await source.login(username, {password: password});

    const expiration = user.credentials.expiration;

    expect(expiration).toBeDefined();
    expect(expiration).not.toBeNull();
    expect(expiration).toBeAfterMoment(now);
  });

  test("invalid login -> null", async () => {
    const username = "user";
    const password = "Not My Password";
    const source = new TestAuthentationSource();
    const user = await source.login(username, {password: password});

    expect(user).toBeNull();
  });

});


/*
 * Make sure that we have no stored credentials.
 */
function verifyCleanAuthStorage() {
  const store = window.localStorage;

  // Make sure storage is clear
  if (store.getItem(Authenticator.STORE_KEY_CLASS)) {
    throw new Error("Found class in local storage.");
  }
  if (store.getItem(Authenticator.STORE_KEY_USER)) {
    throw new Error("Found user in local storage.");
  }
}


/*
 * Populate stored credentials.
 */
async function populateAuthStorage(username, credentials, source) {
  if (!username) {
    username = "Cheese Butter";
  }
  if (!credentials) {
    credentials = {password: username};
  }
  if (!source) {
    source = new TestAuthentationSource();
  }

  const user = await source.login(username, credentials);

  const store = window.localStorage;

  store.setItem(Authenticator.STORE_KEY_CLASS, source.constructor.name);
  store.setItem(Authenticator.STORE_KEY_USER, JSON.stringify(user.toJSON()));

  return {source: source, user: user};
}


describe("Authenticator", () => {

  afterEach(() => {
    Authenticator.eraseStorage();
  });

  test("authentication source is required", () => {
    const message = "authentication source is required";

    expect(() => {new Authenticator()}).toThrow(message);
    expect(() => {new Authenticator(undefined)}).toThrow(message);
    expect(() => {new Authenticator(null)}).toThrow(message);
  });

  test("initial state", () => {
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    expect(authenticator.source).toBe(source);
    expect(authenticator.user).toBeNull();
  });

  test("eraseStorage", () => {
    verifyCleanAuthStorage();

    const username = "Cheese Butter";
    const credentials = { expiration: moment() };
    const user = new User(username, credentials);
    const expiration = moment();
    const store = window.localStorage;

    store.setItem(Authenticator.STORE_KEY_CLASS, "SomeAuthentationSource");
    store.setItem(Authenticator.STORE_KEY_USER, JSON.stringify(user.toJSON()));

    Authenticator.eraseStorage();

    expect(store.getItem(Authenticator.STORE_KEY_CLASS)).toBeNull();
    expect(store.getItem(Authenticator.STORE_KEY_USER)).toBeNull();
  });

  test("saveToStorage, logged in", async () => {
    verifyCleanAuthStorage();

    const username = "Cheese Butter";
    const credentials = { password: username };
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);
    const now = moment();

    const result = await authenticator._login(username, credentials);

    if (!result) { throw new Error("login failed"); }

    // Make sure we don't have accidental side effects from login
    verifyCleanAuthStorage();

    authenticator.saveToStorage();

    expect(Authenticator._sourceClassFromStorage()).toEqual(
      source.constructor.name
    );

    const user = Authenticator._userFromStorage();

    expect(user).not.toBeNull();
    expect(user.username).toEqual(username);
  });

  test("saveToStorage, not logged in", () => {
    verifyCleanAuthStorage();

    const username = "Cheese Butter";
    const credentials = {password: username};
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    authenticator.saveToStorage();

    expect(Authenticator._sourceClassFromStorage()).toBeNull();
    expect(Authenticator._userFromStorage()).toBeNull();
  });

  test("loadFromStorage, empty", () => {
    verifyCleanAuthStorage();

    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, valid", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();
    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(true);
    expect(
      JSON.stringify(authenticator.user.toJSON())
    ).toEqual(
      JSON.stringify(user.toJSON())
    );
  });

  test("loadFromStorage, populated, missing class", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.removeItem(Authenticator.STORE_KEY_CLASS);

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, unknown class", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.setItem(Authenticator.STORE_KEY_CLASS, "XYZZY");

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, missing user", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.removeItem(Authenticator.STORE_KEY_USER);

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, bogus user (invalid JSON)", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.setItem(Authenticator.STORE_KEY_USER, "*");

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, bogus user (no username)", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.setItem(
      Authenticator.STORE_KEY_USER, JSON.stringify({credentials: {}})
    );

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("loadFromStorage, populated, bogus user (no credentials)", async () => {
    verifyCleanAuthStorage();

    const { source, user } = await populateAuthStorage();

    window.localStorage.setItem(
      Authenticator.STORE_KEY_USER, JSON.stringify({username: "Hubcap"})
    );

    const authenticator = new Authenticator(source);

    expect(authenticator.isLoggedIn()).toBe(false);
    expect(authenticator.user).toBeNull();
  });

  test("load and save round-trip", async () => {
    verifyCleanAuthStorage();

    const username = "Cheese Butter";
    const credentials = {password: username};
    const source = new TestAuthentationSource();
    const authenticator1 = new Authenticator(source);
    const now = moment();

    const result = await authenticator1.login(username, credentials);

    if (!result) { throw new Error("login failed"); }

    const authenticator2 = new Authenticator(source);

    expect(
      JSON.stringify(authenticator2.user.toJSON())
    ).toEqual(
      JSON.stringify(authenticator1.user.toJSON())
    );
  });

  test("valid login -> user", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }

    const user = authenticator.user;

    expect(user.username).toEqual(username);

    expect(authenticator.isLoggedIn()).toBe(true);
  });

  test("valid login -> expiration", async () => {
    const username = "user";
    const password = username;
    const now = moment();
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }

    const expiration = authenticator.user.credentials.expiration;

    expect(expiration).toBeAfterMoment(now);
  });

  test("valid login -> stored", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);
    const now = moment();

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }

    const user = Authenticator._userFromStorage();

    expect(user).not.toBeNull();
    expect(user.username).toEqual(username);
  });

  test("valid login -> notify delegate", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    let notified = false;
    authenticator.delegate = () => { notified = true; }

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }

    expect(notified).toBe(true);
  });

  test("invalid login", async () => {
    const username = "user";
    const password = "Not My Password";
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (result) { throw new Error("login failed to fail"); }

    expect(authenticator.user).toBe(null);
    expect(authenticator.isLoggedIn()).toBe(false);
  });

  test("invalid login after prior login keeps user", async () => {
    const username = "user";
    const goodPassword = username;
    const badPassword = "Not My Password";
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);
    let result;

    result = await authenticator.login(
      username, {password: goodPassword}
    );

    if (!result) { throw new Error("login failed"); }

    result = await authenticator.login(
      username, {password: badPassword}
    );

    if (result) { throw new Error("login failed to fail"); }

    expect(authenticator.user.username).toEqual(username);
    expect(authenticator.isLoggedIn()).toBe(true);
  });

  test("logout", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }
    if (!authenticator.isLoggedIn()) { throw new Error("isLoggedIn() fail?"); }

    await authenticator.logout();

    expect(authenticator.user).toBe(null);
    expect(authenticator.isLoggedIn()).toBe(false);
  });

  test("logout -> stored", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }
    if (!authenticator.isLoggedIn()) { throw new Error("isLoggedIn() fail?"); }

    await authenticator.logout();

    expect(Authenticator._userFromStorage()).toBeNull();
  });

  test("valid login -> notify delegate", async () => {
    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    const result = await authenticator.login(username, {password: password});

    if (!result) { throw new Error("login failed"); }
    if (!authenticator.isLoggedIn()) { throw new Error("isLoggedIn() fail?"); }

    let notified = false;
    authenticator.delegate = () => { notified = true; }

    await authenticator.logout();

    expect(notified).toBe(true);
  });

  test("isLoggedIn, valid", async () => {
    verifyCleanAuthStorage();

    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    // Authenticate via source and set attributes directly, since we are not
    // trying to test Authenticator.login() here.
    const user = await source.login(username, {password: password});

    authenticator.user = user;

    expect(authenticator.isLoggedIn()).toBe(true);
  });

  test("isLoggedIn, null user", async () => {
    verifyCleanAuthStorage();

    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    authenticator.user = null;

    expect(authenticator.isLoggedIn()).toBe(false);
  });

  test("isLoggedIn, expired", async () => {
    verifyCleanAuthStorage();

    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    // Authenticate via source and set attributes directly, since we are not
    // trying to test Authenticator.login() here.
    const user = await source.login(username, {password: password});
    user.credentials.expiration = moment().subtract(1, "second");

    authenticator.user = user;

    expect(authenticator.isLoggedIn()).toBe(false);
  });

  test("loggedInUser, valid", async () => {
    verifyCleanAuthStorage();

    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    // Authenticate via source and set attributes directly, since we are not
    // trying to test Authenticator.login() here.
    const user = await source.login(username, {password: password});

    authenticator.user = user;

    expect(authenticator.loggedInUser()).toBe(user);
  });

  test("loggedInUser, expired", async () => {
    verifyCleanAuthStorage();

    const username = "user";
    const password = username;
    const source = new TestAuthentationSource();
    const authenticator = new Authenticator(source);

    // Authenticate via source and set attributes directly, since we are not
    // trying to test Authenticator.login() here.
    const user = await source.login(username, {password: password});
    user.credentials.expiration = moment().subtract(1, "second");

    authenticator.user = user;

    expect(authenticator.loggedInUser()).toBeNull();
  });

});
