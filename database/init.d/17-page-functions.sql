create or replace function get_user_main_page(p_user_id integer)
returns json as
$$
    select json_build_object(
                'id', id,
                'title', title
           )
    from pages
    where user_id=p_user_id
      and is_main;
$$ language sql;


create or replace function is_user_authorized_for_page(page_id integer, p_user_id integer)
returns boolean as
$$
    select user_id=p_user_id from pages where id=page_id;
$$ language sql;


create or replace function is_user_authorized_for_block(block_id integer, p_user_id integer)
returns boolean as
$$
    select user_id=p_user_id
    from pages
    where id=(select page_id
              from blocks_parent
              where id=block_id);
$$ language sql;


create or replace function get_page(page_id integer)
returns json as
$$
    select json_build_object('id', id,
                             'parent', parent,
                             'title', title)
    from pages
    where id=page_id;
$$ language sql;


create or replace function set_page_name(page_id integer, new_title varchar)
returns json as
$$
BEGIN
    update pages
    set title=new_title
    where id=page_id;

    return get_page(page_id);
END
$$ language plpgsql;
