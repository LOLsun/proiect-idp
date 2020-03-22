select l, r, (l + r) / 2, (l + r) / 2 = l
from (select coalesce(max(order_in_page), 0) l,
             (select order_in_page
              from blocks where id=2) r
      from blocks
      where order_in_page < (select order_in_page
                             from blocks where id=2)) t;


CREATE OR REPLACE FUNCTION insert_blocks_view() RETURNS TRIGGER AS
$$
BEGIN
    if NEW.block_type = 1 then
        insert into todos (order_in_page, content, done)
               values (NEW.order_in_page, NEW.attrs->'content'::varchar, NEW.attrs->'done'::boolean)
        returning id into NEW.id;
    else
        insert into paragraphs (order_in_page, content)
               values (NEW.order_in_page, NEW.attrs->'content')
        returning id into NEW.id;
    end if;

    return NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_blocks_trigger
INSTEAD OF INSERT ON blocks
FOR EACH ROW EXECUTE PROCEDURE insert_blocks_view();
