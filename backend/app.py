import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from models import db, Admin

# Create Flask app
app = Flask(__name__,
            static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend'),
            static_url_path='')
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Initialize database
db.init_app(app)

# Register route blueprints
from routes.auth import auth_bp
from routes.food import food_bp
from routes.orders import orders_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(food_bp, url_prefix='/api/foods')
app.register_blueprint(orders_bp, url_prefix='/api/orders')


# Health check
@app.route('/api/health')
def health():
    return jsonify({'status': 'OK', 'message': 'Canteen API is running 🍽️'})


# Serve frontend pages
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    # Try to serve the exact file first
    full_path = os.path.join(app.static_folder, path)
    if os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)
    # If the path has no extension, try appending .html
    if '.' not in os.path.basename(path):
        html_path = path + '.html'
        html_full = os.path.join(app.static_folder, html_path)
        if os.path.isfile(html_full):
            return send_from_directory(app.static_folder, html_path)
    # Fallback to index.html
    return send_from_directory(app.static_folder, 'index.html')


# Auto-seed default admin on startup
def seed_default_admin():
    try:
        count = Admin.query.count()
        if count == 0:
            admin = Admin(username='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('🔑 Default admin created (username: admin, password: admin123)')
        else:
            print('🔑 Admin already exists')
    except Exception as e:
        print(f'Seed error: {e}')


if __name__ == '__main__':
    with app.app_context():
        # Create all tables
        db.create_all()
        print('✅ MySQL tables created/verified')

        # Seed default admin
        seed_default_admin()

    port = Config.PORT
    print(f'🚀 Server running on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)
