create function get_all_blocks() returns json as
$$
    select coalesce(json_agg(t), '[]'::json)
    from (select *
          from blocks
          order by order_in_page) t;
$$ language sql;


create function get_block(block_id integer) returns json as
$$
select json_build_object('id', id,
                         'block_type', block_type,
                         'order_in_page', order_in_page,
                         'attrs', attrs)
from blocks
where id=block_id;
$$ language sql;


create function add_block_at_end(block_type integer, attrs json)
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
