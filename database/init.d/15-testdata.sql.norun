select register_user('luca@gmail.com', 'Luca Istrate', 'lucaluca');
select register_user('test@gmail.com', 'Test 1', 'testtest');

insert into todos (page_id, order_in_page, content, done) values (1, 1000, 'read 10 pages', TRUE);
insert into todos (page_id, order_in_page, content, done) values (1, 2000, 'finish the book', FALSE);

insert into paragraphs (page_id, order_in_page, content) values (1, 3000, 'Test **paragraph** 1');
insert into paragraphs (page_id, order_in_page, content) values (1, 4000, 'Test *paragraph* 2');

insert into todos (page_id, parent, order_in_page, content, done) values (1, 3, 1000, 'todo 1.1', FALSE);
insert into paragraphs (page_id, parent, order_in_page, content) values (1, 3, 2000, 'paragraph 1.2');

insert into paragraphs (page_id, parent, order_in_page, content) values (1, 5, 1000, 'paragraph 1.1.1');

insert into todos (page_id, order_in_page, content, done) values (2, 1000, 'test read 10 pages', TRUE);
insert into todos (page_id, order_in_page, content, done) values (2, 2000, 'test finish the book', FALSE);
