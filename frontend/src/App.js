import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Page from './components/Page';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import { FaRegFileAlt, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome } from 'react-icons/fa'
import './App.css'

function App() {
    return (
        <div className="App">
            <Router>
                <nav className="navbar">
                    <ul>
                        <li>
                            <Link to="/" >
                                <FaHome
                                    style={{
                                        marginRight: "5px",
                                        marginBottom: "-3px"
                                    }}
                                />
                                Home
                            </Link>
                        </li>

                        <li>
                            <Link to="/page" >
                                <FaRegFileAlt
                                    style={{
                                        marginRight: "5px",
                                        marginBottom: "-3px"
                                    }}
                                />
                                Main Page
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/"
                                onClick={() => {
                                    localStorage.removeItem('authToken')
                                }}
                            >
                                <FaSignOutAlt
                                    style={{
                                        marginRight: "5px",
                                        marginBottom: "-3px"
                                    }}
                                />
                                Logout
                            </Link>
                        </li>

                        <li>
                            <Link to="/login" >
                                <FaSignInAlt
                                    style={{
                                        marginRight: "5px",
                                        marginBottom: "-3px"
                                    }}
                                />
                                Login
                            </Link>
                        </li>

                        <li>
                            <Link to="/register" >
                                <FaUserPlus
                                    style={{
                                        marginRight: "5px",
                                        marginBottom: "-3px"
                                    }}
                                />
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="main-container">
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
                </div>
            </Router>
        </div>
    );
}

export default App;
