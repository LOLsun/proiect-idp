create or replace function get_all_blocks() returns json as
$$
    select coalesce(json_agg(t), '[]'::json)
    from (select *
          from blocks
          order by order_in_page) t;
$$ language sql;


create or replace function get_block(block_id integer) returns json as
$$
select json_build_object('id', id,
                         'block_type', block_type,
                         'order_in_page', order_in_page,
                         'attrs', attrs)
from blocks
where id=block_id;
$$ language sql;


create or replace function add_block_at_end(block_type integer, attrs json)
returns json as
$$
DECLARE
    new_order integer;
    to_ret json;
BEGIN
    select max(order_in_page) + 1000
    into new_order
    from blocks;

    select json_build_object('id', t.id,
                             'block_type', t.block_type,
                             'order_in_page', t.order_in_page,
                             'attrs', t.attrs)
    into to_ret
    from insert_block(block_type, new_order, attrs) t;

    return to_ret;
END
$$ language plpgsql;


create or replace function add_block_before(before_id integer, block_type integer, attrs json)
returns json as
$$
DECLARE
    new_block_order integer;
    can_insert_block boolean;
    new_block_id integer;
BEGIN
    select (elem_order + max_smaller_order) / 2 new_order,
           ((elem_order + max_smaller_order) / 2) <> max_smaller_order can_insert
    into new_block_order, can_insert_block
    from (select order_in_page elem_order,
                 (select coalesce(max(order_in_page), 0)
                  from blocks
                  where order_in_page < (select order_in_page
                                         from blocks
                                         where id=before_id)) max_smaller_order
          from blocks
          where id=before_id) t;

    if can_insert_block then
        raise notice 'can insert block at %', new_block_order;
        -- insert the block and get the new id
        select id
        into new_block_id
        from insert_block(block_type, new_block_order, attrs);

        -- jsonize the block and return it
        return get_block(new_block_id);
    else
        raise notice 'resizing...';
        -- update orders_in_page so that the blocks spaced out by 1000
        update blocks_parent bp
        set order_in_page=no.new_order
        from (select id,
                     row_number() over(order by order_in_page) * 1000 new_order
              from blocks) no
        where bp.id=no.id;

        return add_block_before(block_type, attrs);
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
          from blocks) t
    where id=after_id;

    raise notice 'next_block_id %', next_block_id;

    if next_block_id is NULL then
        return add_block_at_end(block_type, attrs);
    else
        return add_block_before(next_block_id, block_type, attrs);
    end if;
END
$$ language plpgsql;
