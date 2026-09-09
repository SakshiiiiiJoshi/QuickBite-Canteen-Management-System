from flask import Blueprint, request, jsonify
import jwt
import datetime
from models import db, Admin
from config import Config

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Please provide username and password'}), 400

        admin = Admin.query.filter_by(username=username).first()

        if not admin:
            return jsonify({'message': 'Invalid credentials'}), 401

        if not admin.check_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401

        token = jwt.encode(
            {
                'id': admin.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            },
            Config.SECRET_KEY,
            algorithm='HS256'
        )

        return jsonify({
            'token': token,
            'admin': admin.to_dict(),
        })

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@auth_bp.route('/seed', methods=['POST'])
def seed_admin():
    try:
        existing = Admin.query.filter_by(username='admin').first()

        if existing:
            return jsonify({'message': 'Admin already exists', 'username': 'admin'})

        admin = Admin(username='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

        return jsonify({
            'message': 'Default admin created',
            'username': 'admin',
            'defaultPassword': 'admin123',
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
