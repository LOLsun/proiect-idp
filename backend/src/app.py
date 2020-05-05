from flask import Flask
from flask import request
from json import dumps
from sys import stderr
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
import db_service

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  # TODO load from env
jwt = JWTManager(app)


@app.route('/register', methods=['POST'])
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


@app.route('/login', methods=['POST'])
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

    return {'token': create_access_token(identity=ident)}, 200


@app.route('/defaultpage', methods=['GET'])
@jwt_required
def get_user_main_page():
    current_user = get_jwt_identity()
    user_page = db_service.get_user_main_page(current_user['id'])

    return user_page


@app.route('/pages/<int:page_id>/blocks', methods=['GET'])
@jwt_required
def all_blocks(page_id):
    current_user = get_jwt_identity()
    try:
        return dumps(db_service.get_all_blocks(page_id, current_user['id']))
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/pages/<int:page_id>/blocks', methods=['POST'])
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

@app.route('/blocks/<int:block_id>', methods=['GET'])
@jwt_required
def get_block(block_id):
    current_user = get_jwt_identity()
    try:
        return dumps(db_service.get_block_by_id(block_id, current_user['id']))
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/blocks/<int:block_id>', methods=['PUT'])
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


@app.route('/blocks/<int:block_id>', methods=['DELETE'])
@jwt_required
def delete_block(block_id):
    current_user = get_jwt_identity()
    try:
        db_service.delete_block(block_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/blocks/<int:block_id>/children', methods=['DELETE'])
@jwt_required
def delete_block_children(block_id):
    current_user = get_jwt_identity()
    try:
        db_service.delete_block_children(block_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/move/<int:from_id>/after/<int:to_id>', methods=['PUT'])
@jwt_required
def move_block_after(from_id, to_id):
    current_user = get_jwt_identity()
    try:
        db_service.move_block_after(from_id, to_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


@app.route('/move/<int:from_id>/as_child/<int:to_id>', methods=['PUT'])
@jwt_required
def move_block_as_child(from_id, to_id):
    current_user = get_jwt_identity()
    try:
        db_service.move_block_at_end(from_id, to_id, current_user['id'])
        return {}, 204
    except db_service.AuthorizationError:
        return {'error': 'unauthorized'}, 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
