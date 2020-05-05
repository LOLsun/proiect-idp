create or replace function get_all_blocks(page_id integer) returns json as
$$
DECLARE
    to_ret json;
BEGIN
    select coalesce(json_agg(block_json order by (block_json->>'order')::integer), '[]'::json)
    into to_ret
    from get_json_for_blocks(1, page_id);

    return to_ret;
END
$$ language plpgsql;


create or replace function get_block(block_id integer) returns json as
$$
DECLARE
    to_ret json;
BEGIN
    select block_json
    into to_ret
    from get_json_for_blocks(
            (select l from blocks_levels where id=block_id),
            (select page_id from blocks_attrs where id=block_id)
         )
    where id=block_id;

    return to_ret;
END
$$ language plpgsql;


create or replace function add_block_at_end(block_type integer, block_parent integer, attrs json, page integer)
returns json as
$$
DECLARE
    to_ret json;
BEGIN
    select json_build_object('id', t.id,
                             'page', page,
                             'type', t.block_type,
                             'order', t.order_in_page,
                             'parent', t.parent,
                             'attrs', t.attrs)
    into to_ret
    from insert_block(block_type,
                      page,
                      block_parent,
                      (select coalesce(max(order_in_page), 0) + 1000
                       from blocks_parent
                       where parent is not distinct from block_parent
                         and page_id=page),
                      attrs) t;

    return to_ret;
END
$$ language plpgsql;


-- TODO error checking and stuff
create or replace function get_position_before(before_id integer)
returns integer as
$$
DECLARE
    new_block_order integer;
    can_insert_block boolean;
BEGIN
    select (elem_order + max_smaller_order) / 2 new_order,
           ((elem_order + max_smaller_order) / 2) <> max_smaller_order can_insert
    into new_block_order, can_insert_block
    from (select order_in_page elem_order,
                 (select coalesce(max(order_in_page), 0)
                  from blocks_parent
                  where order_in_page < (select order_in_page
                                         from blocks_parent
                                         where id=before_id)
                    and parent is not distinct from (select parent
                                                     from blocks_parent
                                                     where id=before_id)
                    and page_id=(select page_id from blocks_parent where id=before_id)
                  ) max_smaller_order
          from blocks_parent
          where id=before_id) t;

    if can_insert_block then
        return new_block_order;
    end if;

    return NULL;
END
$$ language plpgsql;


-- TODO docstring
create or replace function space_out_siblings(block_id integer) returns void as
$$
    update blocks_parent bp
    set order_in_page=no.new_order
    from (select id,
                 row_number() over(order by order_in_page) * 1000 new_order
          from blocks_parent
          where parent is not distinct from (select parent from blocks_parent where id=block_id)
            and page_id=(select page_id from blocks_parent where id=block_id)) no
    where bp.id=no.id;
$$ language sql;


-- TODO treat errors (like non-existent before_id)
create or replace function add_block_before(before_id integer, block_type integer, attrs json)
returns json as
$$
DECLARE
    new_block_order integer;
BEGIN
    new_block_order := get_position_before(before_id);

    if new_block_order is not NULL then
        return get_block((select id from insert_block(
            block_type,
            (select page_id from blocks_parent where id=before_id),
            (select parent from blocks_parent where id=before_id),
            new_block_order,
            attrs
        )));
    else
        -- update orders_in_page so that the blocks are spaced out by 1000
        -- TODO this may fail in which case we'll enter an infinite recursion
        perform space_out_siblings(before_id);

        return add_block_before(before_id, block_type, attrs);
    end if;

    -- TODO error handling?
    return '{}'::json;
END
$$ language plpgsql;


create or replace function add_block_after(after_id integer, block_type integer, attrs json)
returns json as
$$
DECLARE
    next_block_id integer;
BEGIN
    select next_id
    into next_block_id
    from (select id, lead(id, 1, NULL) over(order by order_in_page) next_id
          from blocks_parent
          where parent is not distinct from (select parent from blocks_parent where id=after_id)
            and page_id=(select page_id from blocks_parent where id=after_id)) t
    where id=after_id;

    if next_block_id is NULL then
        return add_block_at_end(block_type,
                                (select parent from blocks_parent where id=after_id),
                                attrs,
                                (select page_id from blocks_parent where id=after_id));
    else
        return add_block_before(next_block_id, block_type, attrs);
    end if;
END
$$ language plpgsql;


create or replace function move_block_as_child(block_id integer, new_parent_id integer)
returns json as
$$
BEGIN
    update block_parent
    set parent=new_parent_id
    where id=block_id;

    return get_block(block_id);
END
$$ language plpgsql;


create or replace function move_block_before(block_id integer, before_id integer)
returns json as
$$
DECLARE
    new_block_order integer;
BEGIN
    new_block_order := get_position_before(before_id);

    if new_block_order is not NULL then
        update blocks_parent
        set parent=(select parent from blocks_parent where id=before_id),
            order_in_page=new_block_order
        where id=block_id;

        return get_block(block_id);
    else
        -- update orders_in_page so that the blocks are spaced out by 1000
        -- TODO this may fail in which case we'll enter an infinite recursion
        perform space_out_siblings(before_id);

        return move_block_before(block_id, before_id);
    end if;

    -- TODO error handling?
    return '{}'::json;
END
$$ language plpgsql;


create or replace function move_block_at_end(block_id integer, parent_id integer)
returns json as
$$
BEGIN
    update blocks_parent
    set parent=parent_id,
        order_in_page=(select coalesce(max(order_in_page), 0) + 1000
                       from blocks_parent
                       where parent is not distinct from parent_id)
    where id=block_id;

    return get_block(block_id);
END
$$ language plpgsql;


create or replace function move_block_after(block_id integer, after_id integer)
returns json as
$$
DECLARE
    next_block_id integer;
BEGIN
    select next_id
    into next_block_id
    from (select id, lead(id, 1, NULL) over(order by order_in_page) next_id
          from blocks_parent
          where parent is not distinct from (select parent from blocks_parent where id=after_id)
            and page_id=(select page_id from blocks_parent where id=after_id)) t
    where id=after_id;

    if next_block_id is NULL then
        return move_block_at_end(block_id,
                                 (select parent from blocks_parent where id=after_id));
    else
        return move_block_before(block_id, next_block_id);
    end if;
END
$$ language plpgsql;
