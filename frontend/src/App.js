import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Page from './components/Page';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import './App.css'

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path="/register">
                        <Register />
                    </Route>
                    <Route exact path="/login">
                        <Login />
                    </Route>

                    <Route
                        exact path="/page/"
                        component={Page}
                    />

                    <Route
                        exact path="/page/:page"
                        render={props => <Page page={props.match.params.page} {...props} />}
                    />

                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
