create table users (
    id serial primary key,
    email varchar(128) unique not null,
    name varchar(64) not null,
    password text not null
);

create table pages (
    id serial primary key,
    parent integer, -- TODO proper fk (to pages)
    user_id integer references users(id),
    title varchar(256) not null,
    is_main boolean
);

create table blocks_parent (
    id serial primary key,
    parent integer,  -- proper fk
    page_id integer not null,  -- proper fk
    order_in_page integer
);


create table paragraphs (
    content varchar not null
) inherits (blocks_parent);

create table todos (
    content varchar not null,
    done boolean not null

) inherits (blocks_parent);

create table page_blocks (
    ref_page_id integer not null -- TODO proper fk
) inherits (blocks_parent);

create table bullets (
    content varchar not null
) inherits (blocks_parent);

create table numbereds (
    content varchar not null
) inherits (blocks_parent);

create table headers1 (
    content varchar not null
) inherits (blocks_parent);

create table headers2 (
    content varchar not null
) inherits (blocks_parent);

create table headers3 (
    content varchar not null
) inherits (blocks_parent);

create table dividers () inherits (blocks_parent);

create table maths (
    content varchar not null
) inherits (blocks_parent);

create table urls (
    content varchar not null
) inherits (blocks_parent);


create view blocks_attrs as
select id,
       1 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from paragraphs
UNION ALL
select id,
       2 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content, 'done', done) attrs
from todos
UNION ALL
select id,
       3 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content',
                         (select title from pages where id=ref_page_id),
                         'page_id',
                         ref_page_id) attrs
from page_blocks
UNION ALL
select id,
       4 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from bullets
UNION ALL
select id,
       5 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from numbereds
UNION ALL
select id,
       6 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from headers1
UNION ALL
select id,
       7 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from headers2
UNION ALL
select id,
       8 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from headers3
UNION ALL
select id,
       9 block_type,
       parent,
       order_in_page,
       page_id,
       '{}'::json attrs
from dividers
UNION ALL
select id,
       10 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from maths
UNION ALL
select id,
       11 block_type,
       parent,
       order_in_page,
       page_id,
       json_build_object('content', content) attrs
from urls;


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





create or replace function get_json_for_blocks(d integer, p_page_id integer)  -- d == depth
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
                                     'page_id', ba.page_id,
                                     'type', ba.block_type) block_json
            from blocks_levels bl,
                 blocks_attrs ba
            where bl.id=ba.id
              and bl.l=(select max(l) from blocks_levels)
              and page_id=p_page_id
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
                       'page_id', ba.page_id,
                       'type', ba.block_type,
                       'children', children_jsons.children_json
                   ))
            from (select bl.id,
                         json_agg(c.block_json order by (c.block_json->>'order')::integer)
                           filter (where c.block_json is not null) children_json
                  from blocks_levels bl
                       left outer join
                       get_json_for_blocks(d+1, p_page_id) c
                       on bl.id=c.parent
                  where bl.l=d
                  group by bl.id) children_jsons
                 join
                 blocks_attrs ba
                 on ba.id=children_jsons.id
            where page_id=p_page_id
        );
    end if;
END
$$ language plpgsql;


CREATE OR REPLACE FUNCTION insert_block(
    block_type integer,
    page integer,
    parent integer,
    order_in_page integer,
    attrs json
) RETURNS blocks_attrs AS
$$
DECLARE
    ret blocks_attrs;
    new_id integer;
    new_page_id integer;
BEGIN
    if block_type = 1 then
        insert into paragraphs (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 2 then
        insert into todos (page_id, parent, order_in_page, content, done)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar, (attrs->>'done')::boolean)
        returning id into new_id;
    end if;

    if block_type = 3 then
        insert into pages (parent, user_id, title, is_main) values (
            page,
            (select user_id from pages where id=page),
            (attrs->>'content')::varchar,
            false
        ) returning id into new_page_id;

        insert into page_blocks (page_id, parent, order_in_page, ref_page_id)
               values (page, parent, order_in_page, new_page_id)
        returning id into new_id;
    end if;

    if block_type = 4 then
        insert into bullets (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 5 then
        insert into numbereds (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 6 then
        insert into headers1 (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 7 then
        insert into headers2 (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 8 then
        insert into headers3 (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 9 then
        insert into dividers (page_id, parent, order_in_page)
               values (page, parent, order_in_page)
        returning id into new_id;
    end if;

    if block_type = 10 then
        insert into maths (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 11 then
        insert into urls (page_id, parent, order_in_page, content)
               values (page, parent, order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

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
    l_block_type integer;
    l_page_id integer;
BEGIN
    select block_type, (attrs->>'page_id')::integer
    into l_block_type, l_page_id
    from blocks_attrs where id=block_id;

    -- if it's a page block
    if l_block_type=3 then
        -- delete all the blocks from the page
        for i in
            select bp.id
            from blocks_parent bp
                 join
                 blocks_levels bl
                 on bp.id=bl.id
            where page_id=l_page_id
              and l=1
        loop
            perform delete_block(i.id);
        end loop;

        -- delete the page itself
        delete from pages where id=l_page_id;
    end if;

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


create or replace function update_block_attrs(block_id integer, attrs json) returns void as
$$
DECLARE
    type int;
BEGIN
    select block_type
    into type
    from blocks_attrs
    where id=block_id;

    if type = 1 then
        update paragraphs
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 2 then
        update todos
        set content=coalesce((attrs->>'content')::varchar, content),
            done=coalesce((attrs->>'done')::boolean, done)
        where id=block_id;
    end if;

    if type = 3 then
        update pages
        set title=coalesce((attrs->>'content')::varchar, title)
        where id=(select ref_page_id from page_blocks where id=block_id);
    end if;

    if type = 4 then
        update bullets
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 5 then
        update numbereds
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 6 then
        update headers1
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 7 then
        update headers2
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 8 then
        update headers2
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 10 then
        update maths
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;

    if type = 11 then
        update urls
        set content=coalesce((attrs->>'content')::varchar, content)
        where id=block_id;
    end if;
END
$$ language plpgsql;
