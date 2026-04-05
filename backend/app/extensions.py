from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()
cors = CORS()
migrate = Migrate()
bcrypt = Bcrypt()
