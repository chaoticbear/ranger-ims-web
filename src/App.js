import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router, Redirect, Route, Switch
} from "react-router-dom";

import User from "./auth";


const Login = lazy(() => import("./components/Login"));
const Home = lazy(() => import("./routes/Home"));
const NotFound = lazy(() => import("./routes/NotFound"));


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {user: null};
  }

  login = async (username, password) => {
    console.log("Logging in as " + username + "...");
    this.setState({user: new User(username)});
  }

  logout = async () => {
    console.log("Logging out from user " + this.state.user + "...")
    this.setState({user: null});
  }

  render() {
    return (
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>

            {/* Send root URL to Home screen URL */}
            <Route exact path="/">
              <Redirect to="/ims/" />
            </Route>

            {/* Home Screen */}
            <Route exact path="/ims/">
              <Login login={this.login} user={this.state.user}>
                <Home user={this.state.user} />
              </Login>
            </Route>

            {/* Not found */}
            <Route path="*">
              <NotFound />
            </Route>

          </Switch>
        </Suspense>
      </Router>
    );
  }

}
