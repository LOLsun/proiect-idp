from flask import Flask
from flask import request
from json import dumps
from sys import stderr
import db_service

app = Flask(__name__)


@app.route('/blocks', methods=['GET', 'OPTIONS'])
def all_blocks():
    return dumps(db_service.get_all_blocks())


@app.route('/blocks', methods=['POST', 'OPTIONS'])
def new_block():
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

    if before is not None:
        return db_service.add_block_before(before, block_type, block_attrs), 201

    if after is not None:
        return db_service.add_block_after(after, block_type, block_attrs), 201

    return db_service.add_block_at_end(block_type, post_data.get('parent'), block_attrs), 201

@app.route('/blocks/<int:block_id>', methods=['GET', 'OPTIONS'])
def get_block(block_id):
    return dumps(db_service.get_block_by_id(block_id))


@app.route('/blocks/<int:block_id>', methods=['PUT', 'OPTIONS'])
def update_block(block_id):
    db_service.update_block_attrs(block_id, dumps(request.get_json().get('attrs', {})))
    return {}, 204


@app.route('/blocks/<int:block_id>', methods=['DELETE', 'OPTIONS'])
def delete_block(block_id):
    db_service.delete_block(block_id)
    return {}, 204


@app.route('/blocks/<int:block_id>/children', methods=['DELETE', 'OPTIONS'])
def delete_block_children(block_id):
    db_service.delete_block_children(block_id)
    return {}, 204


@app.route('/move/<int:from_id>/after/<int:to_id>', methods=['PUT'])
def move_block_after(from_id, to_id):
    db_service.move_block_after(from_id, to_id)
    return {}, 204


@app.route('/move/<int:from_id>/as_child/<int:to_id>', methods=['PUT'])
def move_block_as_child(from_id, to_id):
    db_service.move_block_at_end(from_id, to_id)
    return {}, 204


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
