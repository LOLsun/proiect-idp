import React, { useState } from 'react';
import { Redirect } from 'react-router-dom'
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const baseUrl = 'http://192.168.100.23:5000/'

export default props => {
    const [ shouldRedirect, setShouldRedirect ] = useState(false)

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        onSubmit: values => {
            axios.post(`${baseUrl}/login`, values)
                .then(response => {
                    localStorage.setItem('authToken', response.data.token)
                    setShouldRedirect(true)
                })
                .catch(err => console.log(err))
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
            password: Yup.string()
                .required('Required'),
        })
    })

    return (
        <div className="login">
            {shouldRedirect ?
                <Redirect push to="/page"/>
                :
                <div>
                    <h1>Login</h1>
                    <form onSubmit={formik.handleSubmit}>
                        <label htmlFor="email">Email Address</label>
                        <input name="email" {...formik.getFieldProps('email')} />
                        {formik.touched.email && formik.errors.email && <div>{formik.errors.email}</div>}

                        <label htmlFor="password">Password:</label>
                        <input name="password" {...formik.getFieldProps('password')} type="password" />
                        {formik.touched.password && formik.errors.password && <div>{formik.errors.password}</div>}

                        <button type="submit">Log in</button>
                    </form>
                </div>
            }
        </div>
    )
}
