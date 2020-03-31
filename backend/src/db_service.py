from psycopg2 import connect


def get_db_conn():
    if not hasattr(get_db_conn, 'db_conn'):
        # TODO get from env
        get_db_conn.db_conn = connect(user="postgres",
                                      password="",
                                      host="database",
                                      port="5432")

    return get_db_conn.db_conn


# TODO remove from __all__
def _call_json_returning_proc(procname, *args):
    result = None
    conn = get_db_conn()

    with conn.cursor() as cur:
        cur.callproc(procname, args)
        result = cur.fetchall()
        result = result[0][0]  # first row, first column represents the json result
    conn.commit()

    return result


def get_all_blocks():
    return _call_json_returning_proc('get_all_blocks')


def get_block_by_id(block_id):
    return _call_json_returning_proc('get_block', block_id)


def add_block_at_end(block_type, attrs):
    return _call_json_returning_proc('add_block_at_end', block_type, attrs)


def add_block_before(before_id, block_type, attrs):
    return _call_json_returning_proc('add_block_before', before_id, block_type, attrs)


def add_block_after(after_id, block_type, attrs):
    return _call_json_returning_proc('add_block_after', after_id, block_type, attrs)
