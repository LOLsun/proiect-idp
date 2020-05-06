import React, { useState } from 'react';
import { Redirect } from 'react-router-dom'
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const baseUrl = '/api/'

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
                    <h1 className="form-title">
                        <center>
                            Login
                        </center>
                    </h1>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-item">
                            <label htmlFor="email">Email Address</label> <br />
                            <input name="email" {...formik.getFieldProps('email')} />
                            {formik.touched.email && formik.errors.email &&
                                <div className="form-error">{formik.errors.email}</div>
                            }
                        </div>

                        <div className="form-item">
                            <label htmlFor="password">Password:</label> <br />
                            <input name="password" {...formik.getFieldProps('password')} type="password" />
                            {formik.touched.password && formik.errors.password &&
                                <div className="form-error">{formik.errors.password}</div>
                            }
                        </div>

                        <button type="submit" className="form-submit">Log in</button>
                    </form>
                </div>
            }
        </div>
    )
}
