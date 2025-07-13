import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../services/auth.service';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Email is invalid'),
    fullName: Yup.string()
      .required('Full name is required')
      .min(3, 'Full name must be at least 3 characters')
      .max(50, 'Full name must not exceed 50 characters'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), null], 'Confirm Password does not match')
  });

  const handleRegister = (formValue) => {
    const { username, email, password, fullName } = formValue;
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    AuthService.register(username, email, password, fullName)
      .then(response => {
        setMessage(response.data.message);
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch(error => {
        const resMessage = 
          (error.response && 
           error.response.data && 
           error.response.data.message) || 
          error.message || 
          error.toString();
        
        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      });
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Header as="h5" className="text-center">Register</Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleRegister}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    {!successful && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.username && errors.username}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.username}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={values.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.fullName && errors.fullName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.fullName}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.password && errors.password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && errors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading} className="w-100">
                          {loading ? 'Loading...' : 'Register'}
                        </Button>
                      </>
                    )}

                    {message && (
                      <Alert variant={successful ? 'success' : 'danger'} className="mt-3">
                        {message}
                      </Alert>
                    )}
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
