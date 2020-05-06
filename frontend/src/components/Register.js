import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const baseUrl = '/api/'

export default props => {
    const [ shouldRedirect, setShouldRedirect ] = useState(false)

    const formik = useFormik({
        initialValues: {
            email: '',
            name: '',
            password: '',
        },
        onSubmit: values => {
            axios.post(`${baseUrl}/register`, values)
                .then(response => {
                    setShouldRedirect(true)
                })
                .catch(err => console.log(err))
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
            name: Yup.string()
                .required('Required'),
            password: Yup.string()
                .min(8, 'Must be at least 8 characters long')
                .required('Required'),
        })
    })

    return (
        <div className="register">
            {shouldRedirect ?
                <Redirect push to="/login" />
                :
                <div>
                    <h1 className="form-title">
                        <center>
                            Create a new account
                        </center>
                    </h1>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-item">
                            <label htmlFor="email">Email Address:</label> <br />
                            <input name="email" {...formik.getFieldProps('email')} />
                            {formik.touched.email && formik.errors.email &&
                                <div className="form-error">{formik.errors.email}</div>
                            }
                        </div>

                        <div className="form-item">
                            <label htmlFor="name">Name:</label> <br />
                            <input name="name" {...formik.getFieldProps('name')} />
                            {formik.touched.name && formik.errors.name &&
                                <div className="form-error">{formik.errors.name}</div>
                            }
                        </div>

                        <div className="form-item">
                            <label htmlFor="password">Password:</label> <br />
                            <input name="password" {...formik.getFieldProps('password')} type="password" />
                            {formik.touched.password && formik.errors.password &&
                                <div className="form-error">{formik.errors.password}</div>
                            }
                        </div>

                        <button type="submit" className="form-submit">Register</button>
                    </form>
                </div>
            }
        </div>
    )
}
