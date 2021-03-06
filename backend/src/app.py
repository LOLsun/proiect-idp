from flask import Flask
from flask import request
from json import dumps
from sys import stderr
from datetime import timedelta
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from prometheus_flask_exporter import PrometheusMetrics
import db_service

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  # TODO load from env
jwt = JWTManager(app)
metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='1.0.3')


@app.route('/api/register', methods=['POST'])
def register_user():
    if not request.is_json:
        return {'msg': 'Missing JSON in request'}, 400

    post_data = request.get_json()
    email = post_data.get('email', None)
    name = post_data.get('name', None)
    password = post_data.get('password', None)

    if not email:
        return {'msg': 'Missing email in request'}, 400
    if not name:
        return {'msg': 'Missing name in request'}, 400
    if not password:
        return {'msg': 'Missing password in request'}, 400

    ok = db_service.register_user(email, name, password)
    if not ok:
        return {'msg': 'Something went wrong'}, 400

    return {'msg': 'ok'}, 201


@app.route('/api/login', methods=['POST'])
def login_user():
    if not request.is_json:
        return {'msg': 'Missing JSON in request'}, 400

    post_data = request.get_json()
    email = post_data.get('email', None)
    password = post_data.get('password', None)

    if not email:
        return {'msg': 'Missing email in request'}, 400
    if not password:
        return {'msg': 'Missing password in request'}, 400

    ident = db_service.login_user(email, password)
    if 'error' in ident:
        return ident, 400

    return {'token': create_access_token(identity=ident,
                                         expires_delta=timedelta(days=1))}, 200


@app.route('/api/defaultpage', methods=['GET'])
@jwt_required
def get_user_main_page():
    current_user = get_jwt_identity()
    user_page = db_service.get_user_main_page(current_user['id'])

    return user_page


@app.route('/api/pages/<int:page_id>/blocks', methods=['GET'])
@jwt_required
def all_blocks(page_id):
    current_user = get_jwt_identity()
    try:
        return dumps(db_service.get_all_blocks(page_id, current_user['id']))
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/pages/<int:page_id>/blocks', methods=['POST'])
@jwt_required
def new_block(page_id):
    current_user = get_jwt_identity()
    post_data = request.get_json()
    before = post_data.get('add_before')
    after = post_data.get('add_after')

    if before is not None and after is not None:
        return {'error': 'body can only contain "add_before" _or_ "add_after"'}, 400

    try:
        block_type = post_data['block']['block_type']
        block_attrs = dumps(post_data['block']['attrs'])
    except KeyError:
        return {'error': 'bad block format'}, 400

    try:
        if before is not None:
            return db_service.add_block_before(before,
                                               block_type,
                                               block_attrs,
                                               page_id,
                                               current_user['id']), 201

        if after is not None:
            return db_service.add_block_after(after,
                                              block_type,
                                              block_attrs,
                                              page_id,
                                              current_user['id']), 201

        return db_service.add_block_at_end(block_type,
                                           post_data.get('parent'),
                                           block_attrs,
                                           page_id,
                                           current_user['id']), 201
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401

@app.route('/api/blocks/<int:block_id>', methods=['GET'])
@jwt_required
def get_block(block_id):
    current_user = get_jwt_identity()
    try:
        return dumps(db_service.get_block_by_id(block_id, current_user['id']))
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/blocks/<int:block_id>', methods=['PUT'])
@jwt_required
def update_block(block_id):
    current_user = get_jwt_identity()
    try:
        db_service.update_block_attrs(block_id,
                                      dumps(request.get_json().get('attrs', {})),
                                      current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/blocks/<int:block_id>', methods=['DELETE'])
@jwt_required
def delete_block(block_id):
    current_user = get_jwt_identity()
    try:
        db_service.delete_block(block_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/blocks/<int:block_id>/children', methods=['DELETE'])
@jwt_required
def delete_block_children(block_id):
    current_user = get_jwt_identity()
    try:
        db_service.delete_block_children(block_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/move/<int:from_id>/after/<int:to_id>', methods=['PUT'])
@jwt_required
def move_block_after(from_id, to_id):
    current_user = get_jwt_identity()
    try:
        db_service.move_block_after(from_id, to_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/move/<int:from_id>/as_child/<int:to_id>', methods=['PUT'])
@jwt_required
def move_block_as_child(from_id, to_id):
    current_user = get_jwt_identity()
    try:
        db_service.move_block_at_end(from_id, to_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/pages/<int:page_id>', methods=['GET'])
@jwt_required
def get_page_details(page_id):
    current_user = get_jwt_identity()
    try:
        return db_service.get_page(page_id, current_user['id'])
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/api/pages/<int:page_id>/title', methods=['PUT'])
@jwt_required
def set_page_title(page_id):
    current_user = get_jwt_identity()
    if not request.is_json:
        return {'msg': 'Missing JSON in request'}, 400

    post_data = request.get_json()
    if 'title' not in post_data:
        return {'msg': 'Missing title in request'}, 400

    try:
        return db_service.set_page_title(page_id, post_data['title'], current_user['id'])
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


if __name__ == '__main__':
    app.run(host='0.0.0.0')
