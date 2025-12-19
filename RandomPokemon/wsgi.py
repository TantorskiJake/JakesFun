"""
WSGI entry point for production deployment.
Supports subpath deployment (e.g., /pokemon)
"""
import os
from app import app, APPLICATION_ROOT

# If deploying to a subpath, wrap the app
if APPLICATION_ROOT != '/':
    from werkzeug.middleware.dispatcher import DispatcherMiddleware
    
    # Create a root app that dispatches to our app at the subpath
    def create_app():
        root_app = Flask(__name__)
        
        @root_app.route('/')
        def root():
            from flask import redirect
            return redirect(APPLICATION_ROOT)
        
        # Mount the actual app at the subpath
        return DispatcherMiddleware(root_app, {APPLICATION_ROOT: app})
    
    application = create_app()
else:
    application = app

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5001))
    application.run(debug=False, host='0.0.0.0', port=port)

