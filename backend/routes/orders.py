from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem
from middleware import token_required

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/', methods=['POST'])
def place_order():
    try:
        data = request.get_json()

        items = data.get('items', [])
        if not items:
            return jsonify({'message': 'No items in order'}), 400

        customer_name = data.get('customerName')
        table_number = data.get('tableNumber')

        if not customer_name or not table_number:
            return jsonify({'message': 'Customer name and table number are required'}), 400

        order = Order(
            customer_name=customer_name,
            table_number=int(table_number),
            total_amount=float(data.get('totalAmount', 0)),
            status='Placed',
            payment_status='Pending',
        )
        db.session.add(order)
        db.session.flush()  # Get the order ID

        for item in items:
            order_item = OrderItem(
                order_id=order.id,
                food_id=item.get('food'),
                name=item.get('name'),
                quantity=int(item.get('quantity', 1)),
                price=float(item.get('price', 0)),
            )
            db.session.add(order_item)

        db.session.commit()
        return jsonify(order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@orders_bp.route('/', methods=['GET'])
@token_required
def get_all_orders(admin_id):
    try:
        status_filter = request.args.get('status')
        query = Order.query

        if status_filter and status_filter != 'All':
            query = query.filter_by(status=status_filter)

        orders = query.order_by(Order.created_at.desc()).all()
        return jsonify([o.to_dict() for o in orders])

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404
        return jsonify(order.to_dict())

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@token_required
def update_order_status(admin_id, order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404

        data = request.get_json()
        new_status = data.get('status')
        valid_statuses = ['Placed', 'Preparing', 'Ready', 'Delivered']

        if new_status not in valid_statuses:
            return jsonify({'message': 'Invalid status'}), 400

        order.status = new_status
        db.session.commit()
        return jsonify(order.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@orders_bp.route('/<int:order_id>/pay', methods=['PUT'])
def mark_paid(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404

        order.payment_status = 'Paid'
        db.session.commit()
        return jsonify(order.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
