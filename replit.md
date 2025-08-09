# EduStream - Modern Online Teaching Platform

## Overview

EduStream is a comprehensive online teaching platform built with Flask that enables live streaming education, material management, and student-teacher interactions. The platform supports role-based access for teachers and students, featuring real-time class management, file uploads, scheduling, and attendance tracking. It provides a modern, responsive web interface for conducting and participating in online classes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask web framework with SQLAlchemy ORM for database operations
- **Database**: SQLite for development with configurable database URI support (PostgreSQL-ready)
- **Authentication**: Session-based authentication with password hashing using Werkzeug security utilities
- **File Management**: Secure file upload system with configurable upload directory and file type validation
- **Database Models**: User, Class, Enrollment, and Material models with proper relationships

### Frontend Architecture
- **Template Engine**: Jinja2 templating with a base template inheritance pattern
- **Styling**: Custom CSS with CSS variables for theming, modern gradient designs, and responsive layouts
- **JavaScript**: Vanilla JavaScript for interactive features, theme management, and form validation
- **UI Components**: Role-based dashboards, live class interface, material management, and scheduling views

### Security Features
- **Password Security**: Werkzeug password hashing for secure credential storage
- **File Upload Security**: Filename sanitization and file type restrictions
- **Session Management**: Flask sessions with configurable secret keys
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

### Data Storage
- **Primary Database**: SQLAlchemy with declarative base for model definitions
- **File Storage**: Local filesystem storage for uploaded materials with organized directory structure
- **Session Storage**: Server-side session management for user authentication state

### Key Design Patterns
- **MVC Architecture**: Clear separation between models, views (templates), and controllers (routes)
- **Role-Based Access**: Teacher and student roles with different permissions and dashboard views
- **Material Management**: File upload and download system with metadata tracking
- **Live Class System**: Real-time class status management with broadcasting capabilities

## External Dependencies

### Python Packages
- **Flask**: Core web framework
- **Flask-SQLAlchemy**: Database ORM integration
- **Werkzeug**: Security utilities and development server

### Frontend Libraries
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Inter font family for modern typography

### Development Tools
- **SQLite**: Default database for development environment
- **File System**: Local storage for uploaded teaching materials

### Infrastructure Requirements
- **Environment Variables**: Support for DATABASE_URL and SESSION_SECRET configuration
- **File System**: Upload directory with 16MB file size limit
- **Web Server**: Configurable host and port settings for deployment flexibility