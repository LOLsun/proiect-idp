insert into todos (order_in_page, content, done) values (1000, 'read 10 pages', TRUE);
insert into todos (order_in_page, content, done) values (2000, 'finish the book', FALSE);

insert into paragraphs (order_in_page, content) values (3000, 'Test **paragraph** 1');
insert into paragraphs (order_in_page, content) values (4000, 'Test *paragraph* 2');

insert into todos (parent, order_in_page, content, done) values (3, 1000, 'todo 1.1', FALSE);
insert into paragraphs (parent, order_in_page, content) values (3, 2000, 'paragraph 1.2');

insert into paragraphs (parent, order_in_page, content) values (5, 1000, 'paragraph 1.1.1');


/*
-- TODO remove (blocks_test)
insert into blocks_test (order_in_page, content, parent) values (1000, '1', NULL);
insert into blocks_test (order_in_page, content, parent) values (2000, '2', NULL);
insert into blocks_test (order_in_page, content, parent) values (3000, '3', NULL);

insert into blocks_test (order_in_page, content, parent) values (1000, '1.1', 1);
insert into blocks_test (order_in_page, content, parent) values (2000, '1.2', 1);

insert into blocks_test (order_in_page, content, parent) values (1000, '1.2.1', 5);



create view blocks_levels_view as
with recursive blocks_levels as (
    select b.*, 1 l from blocks_test b where parent is NULL
    union
    select b.id, b.parent, b.content, b.order_in_page, blocks_levels.l + 1 l
    from blocks_test b,
         blocks_levels
    where b.parent=blocks_levels.id
)
select *
from blocks_levels;



-- TODO wrap this in a function (don't forget the ORDER BY)

create or replace function get_blocks_recursive(d integer)  -- d == depth
returns table (id integer, parent integer, attrs json) as
$$
BEGIN
    if d >= (select max(l) from blocks_levels_view) then
        return query (
            select t.id,
                   t.parent,
                   json_build_object('order', t.order_in_page,
                                     'content', t.content) attrs
            from blocks_levels_view t
            where l=(select max(l) from blocks_levels_view)
        );
    else
        return query (
            select t.id,
                   t.parent,
                   case when json_agg(c.attrs)
                             filter (where c.attrs is not null) is null then
                                json_build_object('order', t.order_in_page,
                                                  'content', t.content)
                        else json_build_object('order', t.order_in_page,
                                               'content', t.content,
                                               'children', json_agg(c.attrs)) -- TODO order by
                   end attrs
            from blocks_levels_view t
                 left outer join
                 get_blocks_recursive(d+1) c
                 on t.id=c.parent
            where t.l=d
            group by t.id, t.parent, t.order_in_page, t.content
        );
    end if;
END
$$ language plpgsql;
*/
