import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const baseUrl = 'http://192.168.100.23:5000/'

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
                    <h1>Create a new account</h1>
                    <form onSubmit={formik.handleSubmit}>
                        <label htmlFor="email">Email Address</label>
                        <input name="email" {...formik.getFieldProps('email')} />
                        {formik.touched.email && formik.errors.email && <div>{formik.errors.email}</div>}

                        <label htmlFor="name">Name:</label>
                        <input name="name" {...formik.getFieldProps('name')} />
                        {formik.touched.name && formik.errors.name && <div>{formik.errors.name}</div>}

                        <label htmlFor="password">Password:</label>
                        <input name="password" {...formik.getFieldProps('password')} type="password" />
                        {formik.touched.password && formik.errors.password && <div>{formik.errors.password}</div>}

                        <button type="submit">Register</button>
                    </form>
                </div>
            }
        </div>
    )
}
