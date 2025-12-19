"""
WSGI entry point for production deployment.
This file is used by gunicorn to serve the Flask application.
"""
from app import app

# For gunicorn, we just need to expose the app
application = app

