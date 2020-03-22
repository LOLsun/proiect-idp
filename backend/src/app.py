from flask import Flask
from psycopg2 import connect
from json import dumps

app = Flask(__name__)

def get_db_conn():
    if not hasattr(get_db_conn, 'db_conn'):
        # TODO get from env
        get_db_conn.db_conn = connect(user="postgres",
                                      password="",
                                      host="database",
                                      port="5432")

    return get_db_conn.db_conn


@app.route('/blocks', methods=['GET'])
def all_blocks():
    conn = get_db_conn()
    with conn.cursor() as cur:
        cur.callproc('get_all_blocks');
        result = cur.fetchall()
        result = result[0][0]  # first row, first column represents the json result
    conn.commit()
    return dumps(result)


@app.route('/blocks', methods=['POST'])
def new_block():
    conn = get_db_conn()
    with conn.cursor() as cur:
        cur.callproc('add_block_at_end', (1, dumps({'content': 'continutul meu'})));
        result = cur.fetchall()
        result = result[0][0]  # first row, first column represents the json result
    conn.commit()
    return dumps(result)


@app.route('/blocks/<int:block_id>', methods=['GET'])
def get_block(block_id):
    conn = get_db_conn()
    with conn.cursor() as cur:
        cur.callproc('get_block', (block_id,));
        result = cur.fetchall()
        if result:
            result = result[0][0]  # first row, first column represents the json result
    conn.commit()
    return dumps(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
