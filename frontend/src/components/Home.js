import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div className="home">
            <h1>Welcome to Notion!</h1>

            <Link to="/register">Create a new account</Link>
            <Link to="/login">Log in</Link>
        </div>
    )
}
