from functools import wraps
from flask import request, jsonify
import jwt
from config import Config


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'message': 'Not authorized, no token'}), 401

        try:
            decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            admin_id = decoded['id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Not authorized, token invalid'}), 401

        return f(admin_id, *args, **kwargs)

    return decorated
