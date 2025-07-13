import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../services/auth.service';

const Login = ({ setCurrentUser }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: ''
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const handleLogin = (formValue) => {
    const { username, password } = formValue;
    setMessage('');
    setLoading(true);

    AuthService.login(username, password)
      .then(data => {
        setCurrentUser(data);
        navigate('/dashboard');
      })
      .catch(error => {
        const resMessage = 
          (error.response && 
           error.response.data && 
           error.response.data.message) || 
          error.message || 
          error.toString();
        
        setLoading(false);
        setMessage(resMessage);
      });
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Header as="h5" className="text-center">Login</Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
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

                    <Button variant="primary" type="submit" disabled={loading} className="w-100">
                      {loading ? 'Loading...' : 'Login'}
                    </Button>

                    {message && (
                      <Alert variant="danger" className="mt-3">
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

export default Login;
