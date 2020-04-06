create table blocks_parent (
    id serial not null,
    parent integer,  -- proper fk
    order_in_page integer
    -- TODO see if serial creates a pk as well
);


create table paragraphs (
    content varchar not null

) inherits (blocks_parent);

create table todos (
    content varchar not null,
    done boolean not null

) inherits (blocks_parent);

create view blocks_attrs as
select id,
       1 block_type,
       parent,
       order_in_page,
       json_build_object('content', content) attrs
from paragraphs
UNION ALL
select id,
       2 block_type,
       parent,
       order_in_page,
       json_build_object('content', content, 'done', done) attrs
from todos;


create view blocks_levels as
with recursive bl as (
    select b.id, b.parent, 1 l
    from blocks_parent b
    where parent is NULL
    union
    select b.id, b.parent, l + 1 l
    from blocks_parent b,
         bl
    where b.parent=bl.id
)
select *
from bl;





create or replace function get_json_for_blocks(d integer)  -- d == depth
returns table (id integer, parent integer, block_json json) as
$$
BEGIN
    if d >= (select max(l) from blocks_levels) then
        return query (
            select bl.id,
                   bl.parent,
                   json_build_object('order', ba.order_in_page,
                                     'parent', ba.parent,
                                     'attrs', ba.attrs,
                                     'id', ba.id,
                                     'type', ba.block_type) block_json
            from blocks_levels bl,
                 blocks_attrs ba
            where bl.id=ba.id
              and bl.l=(select max(l) from blocks_levels)
        );
    else
        return query (
            select ba.id,
                   ba.parent,
                   json_strip_nulls(json_build_object(
                       'order', ba.order_in_page,
                       'parent', ba.parent,
                       'attrs', ba.attrs,
                       'id', ba.id,
                       'type', ba.block_type,
                       'children', children_jsons.children_json
                   ))
            from (select bl.id,
                         json_agg(c.block_json order by (c.block_json->>'order')::integer)
                           filter (where c.block_json is not null) children_json
                  from blocks_levels bl
                       left outer join
                       get_json_for_blocks(d+1) c
                       on bl.id=c.parent
                  where bl.l=d
                  group by bl.id) children_jsons
                 join
                 blocks_attrs ba
                 on ba.id=children_jsons.id
        );
    end if;
END
$$ language plpgsql;


CREATE OR REPLACE FUNCTION insert_block(
    block_type integer,
    parent integer,
    order_in_page integer,
    attrs json
) RETURNS blocks_attrs AS
$$
DECLARE
    ret blocks_attrs;
    new_id integer;
BEGIN
    if block_type = 1 then
        insert into paragraphs (parent, order_in_page, content)
               values (parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 2 then
        insert into todos (parent, order_in_page, content, done)
               values (parent, order_in_page,
                       (attrs->>'content')::varchar, (attrs->>'done')::boolean)
        returning id into new_id;
    end if;

    -- TODO see if return query works here
    -- TODO rename ret to to_ret
    select *
    into ret
    from blocks_attrs
    where id=new_id;

    return ret;
END
$$ LANGUAGE plpgsql;


create or replace function delete_block(block_id integer) returns void as
$$
DECLARE
    i record;
BEGIN
    for i in
        select id
        from blocks_parent
        where parent=block_id
    loop
        perform delete_block(i.id);
    end loop;

    delete from blocks_parent
    where id=block_id;
END
$$ language plpgsql;


create or replace function delete_children(block_id integer) returns void as
$$
DECLARE
    i record;
BEGIN
    for i in
        select id
        from blocks_parent
        where parent=block_id
    loop
        perform delete_block(i.id);
    end loop;
END
$$ language plpgsql;
