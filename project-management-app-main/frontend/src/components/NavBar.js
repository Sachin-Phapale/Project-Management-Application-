import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import AuthService from '../services/auth.service';

const NavBar = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Project Management</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
                <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link as={Link} to="/profile">
                  {currentUser.username}
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
