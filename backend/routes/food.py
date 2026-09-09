from flask import Blueprint, request, jsonify
from models import db, Food
from middleware import token_required

food_bp = Blueprint('food', __name__)


@food_bp.route('/', methods=['GET'])
def get_all_foods():
    try:
        foods = Food.query.order_by(Food.category, Food.name).all()
        return jsonify([f.to_dict() for f in foods])
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@food_bp.route('/<int:food_id>', methods=['GET'])
def get_food(food_id):
    try:
        food = Food.query.get(food_id)
        if not food:
            return jsonify({'message': 'Food item not found'}), 404
        return jsonify(food.to_dict())
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@food_bp.route('/', methods=['POST'])
@token_required
def add_food(admin_id):
    try:
        data = request.get_json()

        food = Food(
            name=data.get('name'),
            description=data.get('description', ''),
            price=float(data.get('price', 0)),
            category=data.get('category'),
            image=data.get('image', ''),
            is_available=data.get('isAvailable', True),
        )

        db.session.add(food)
        db.session.commit()

        return jsonify(food.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400


@food_bp.route('/<int:food_id>', methods=['PUT'])
@token_required
def update_food(admin_id, food_id):
    try:
        food = Food.query.get(food_id)
        if not food:
            return jsonify({'message': 'Food item not found'}), 404

        data = request.get_json()

        if 'name' in data and data['name']:
            food.name = data['name']
        if 'description' in data:
            food.description = data['description']
        if 'price' in data:
            food.price = float(data['price'])
        if 'category' in data and data['category']:
            food.category = data['category']
        if 'image' in data:
            food.image = data['image']
        if 'isAvailable' in data:
            food.is_available = data['isAvailable']

        db.session.commit()
        return jsonify(food.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400


@food_bp.route('/<int:food_id>', methods=['DELETE'])
@token_required
def delete_food(admin_id, food_id):
    try:
        food = Food.query.get(food_id)
        if not food:
            return jsonify({'message': 'Food item not found'}), 404

        db.session.delete(food)
        db.session.commit()
        return jsonify({'message': 'Food item deleted'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
