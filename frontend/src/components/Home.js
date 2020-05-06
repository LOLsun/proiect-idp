import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div className="home">
            <center>
                <h1>
                    Welcome to <span className="home-brand">Notion</span>!
                </h1>
            </center>

            <div className="home-buttons">
                <Link to="/login" className="home-login">
                    <center>
                        Log in
                    </center>
                </Link>

                <Link to="/register" className="home-register">
                    <center>
                        Register
                    </center>
                </Link>
            </div>
        </div>
    )
}
