from psycopg2 import connect, Error as GenericDatabaseError
from sys import stderr

class AuthorizationError(Exception):
    pass


def get_db_conn():
    if not hasattr(get_db_conn, 'db_conn'):
        # TODO get from env
        get_db_conn.db_conn = connect(user="postgres",
                                      password="",
                                      host="database",
                                      port="5432")

    return get_db_conn.db_conn


# TODO remove from __all__
# TODO try except finally with commit and rollback properly
def _call_returning_proc(procname, *args):
    result = None
    conn = get_db_conn()

    with conn.cursor() as cur:
        cur.callproc(procname, args)
        result = cur.fetchall()
        result = result[0][0]  # first row, first column represents the json result
    conn.commit()

    return result


# TODO remove from __all__
def _call_void_proc(procname, *args):
    result = None
    conn = get_db_conn()

    try:
        with conn.cursor() as cur:
            cur.callproc(procname, args)
    except GenericDatabaseError:
        conn.rollback()
        return False
    else:
        conn.commit()

    return True


def get_all_blocks(page_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)

    if is_authorized:
        return _call_returning_proc('get_all_blocks', page_id)

    raise AuthorizationError


def get_block_by_id(block_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         block_id, user_id)

    if is_authorized:
        return _call_returning_proc('get_block', block_id)

    raise AuthorizationError


def add_block_at_end(block_type, parent, attrs, page_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)
    if is_authorized:
        return _call_returning_proc('add_block_at_end', block_type, parent, attrs, page_id)

    return AuthorizationError


def add_block_before(before_id, block_type, attrs, page_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)
    if is_authorized:
        return _call_returning_proc('add_block_before', before_id, block_type, attrs)

    raise AuthorizationError


def add_block_after(after_id, block_type, attrs, page_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)
    if is_authorized:
        return _call_returning_proc('add_block_after', after_id, block_type, attrs)

    raise AuthorizationError


def delete_block(block_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         block_id, user_id)

    if is_authorized:
        _call_void_proc('delete_block', block_id)
        return

    raise AuthorizationError


def delete_block_children(block_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         block_id, user_id)

    if is_authorized:
        _call_void_proc('delete_children', block_id)
        return

    raise AuthorizationError


def move_block_after(from_id, to_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         from_id, user_id)
    is_authorized |= _call_returning_proc('is_user_authorized_for_block',
                                         to_id, user_id)

    if is_authorized:
        return _call_returning_proc('move_block_after', from_id, to_id)

    raise AuthorizationError


def move_block_at_end(from_id, parent_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         from_id, user_id)
    is_authorized |= _call_returning_proc('is_user_authorized_for_block',
                                         parent_id, user_id)

    if is_authorized:
        return _call_returning_proc('move_block_at_end', from_id, parent_id)

    raise AuthorizationError


def update_block_attrs(block_id, attrs, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_block',
                                         block_id, user_id)

    if is_authorized:
        _call_void_proc('update_block_attrs', block_id, attrs)
        return

    raise AuthorizationError


def register_user(email, name, password):
    return _call_void_proc('register_user', email, name, password)


def login_user(email, password):
    return _call_returning_proc('login_user', email, password)


def get_user_main_page(user_id):
    return _call_returning_proc('get_user_main_page', user_id)


def get_page(page_id, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)

    if is_authorized:
        return _call_returning_proc('get_page', page_id)

    raise AuthorizationError

def get_page(page_id, new_title, user_id):
    is_authorized = _call_returning_proc('is_user_authorized_for_page',
                                         page_id, user_id)

    if is_authorized:
        return _call_returning_proc('set_page_name', page_id, new_title)

    raise AuthorizationError
