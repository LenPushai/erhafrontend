import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaQuoteRight, FaChartBar, FaPlus, FaList } from 'react-icons/fa';

/**
 * 🧭 Navigation Component
 * Main navigation for Quote Management module
 */
const NavigationBar = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FaQuoteRight className="me-2" />
          💰 ERHA Quote Management
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="fw-semibold">
              <FaChartBar className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/quotes" className="fw-semibold">
              <FaList className="me-1" /> Quotes
            </Nav.Link>
            <Nav.Link as={Link} to="/quotes/new" className="fw-semibold">
              <FaPlus className="me-1" /> New Quote
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics" className="fw-semibold">
              <FaChartBar className="me-1" /> Analytics
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
