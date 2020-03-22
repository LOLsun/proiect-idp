create table blocks_parent (
    id serial not null,
    order_in_page integer
);
/*

create table paragraphs (
    content varchar not null
) inherits (blocks_parent);

create table todos (
    content varchar not null,
    done boolean not null
) inherits (blocks_parent);


insert into paragraphs ( 1000, 'ana are **mere**.');
insert into paragraphs ( 2000, 'mere are _ana_.');

insert into todos ( 3000, 'pay the bills', FALSE);
insert into todos ( 4000, 'write some code', TRUE);


create view blocks as
select id, 0 block_type,  order_in_page, json_build_object('content', content) attrs
from paragraphs
union all
select id, 1 block_type,  order_in_page, json_build_object('content', content, 'done', done) attrs
from todos;



CREATE OR REPLACE FUNCTION insert_blocks_view() RETURNS TRIGGER AS
$$
BEGIN
    if NEW.block_type = 1 then
        insert into todos (order_in_page, content, done)
               values (NEW.order_in_page,
                       (NEW.attrs->>'content')::varchar,
                       (NEW.attrs->>'done')::boolean)
        returning id into NEW.id;
    else
        insert into paragraphs (order_in_page, content)
               values (NEW.order_in_page,
                       (NEW.attrs->>'content')::varchar)
        returning id into NEW.id;
    end if;

    return NEW;
END
$$ LANGUAGE plpgsql;


CREATE TRIGGER insert_blocks_trigger
INSTEAD OF INSERT ON blocks
FOR EACH ROW EXECUTE PROCEDURE insert_blocks_view();



insert into blocks (block_type, order_in_page, attrs) values (1, 500, '{"content": "fa ciorba", "done": false}'::json);

*/




create table paragraphs (
    content varchar not null
    
) inherits (blocks_parent);

create table todos (
    content varchar not null, 
    done boolean not null
    
) inherits (blocks_parent);

create view blocks as
select id,
       1 block_type,
       order_in_page,
       json_build_object('content', content) attrs
from paragraphs
UNION ALL 
select id,
       2 block_type,
       order_in_page,
       json_build_object('content', content, 'done', done) attrs
from todos

;

CREATE OR REPLACE FUNCTION insert_block(
    block_type integer,
    order_in_page integer,
    attrs json
) RETURNS blocks AS
$$
DECLARE
    ret blocks;
    new_id integer;
BEGIN
    if block_type = 1 then
        insert into paragraphs (order_in_page, content)
               values (order_in_page,
                       (attrs->>'content')::varchar)
        returning id into new_id;
    end if;

    if block_type = 2 then
        insert into todos (order_in_page, content, done)
               values (order_in_page,
                       (attrs->>'content')::varchar, (attrs->>'done')::boolean)
        returning id into new_id;
    end if;

    select *
    into ret
    from blocks
    where id=new_id;

    return ret;
END
$$ LANGUAGE plpgsql;





