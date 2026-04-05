import os
import sys
from app import create_app

# Ensure current directory is in path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Use a unique variable name to avoid shadowing the 'app' package
flask_app = create_app()

if __name__ == "__main__":
    # Start the server on port 5000
    flask_app.run(host="0.0.0.0", port=5000, debug=flask_app.config.get("DEBUG", False))
