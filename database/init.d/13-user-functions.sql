create extension pgcrypto;


create or replace function register_user(
    user_email varchar(128),
    user_name varchar(64),
    user_password text
) returns void as
$$
DECLARE
    new_user_id integer;
BEGIN
    insert into users (email, name, password) values (
        user_email,
        user_name,
        crypt(user_password, gen_salt('bf'))
    ) returning id into new_user_id;

    insert into pages (parent, user_id, title, is_main) values (
        NULL, new_user_id, user_name || '''s Main Page', true
    );
END
$$ language plpgsql;


create or replace function login_user(
    user_email varchar(128),
    user_password text
) returns json as

$func$
DECLARE
    to_ret json;
BEGIN
    if (select count(*) from users where email=user_email) = 0 then
        return $${"error": "email doesn't exist"}$$::json;
    end if;

    select case
            when password_okay then
                json_build_object('id', id, 'email', email, 'name', name)
            else $${"error": "wrong password"}$$::json
           end result
    into to_ret
    from (select id, email, name, password=crypt(user_password, password) password_okay
          from users
          where email=user_email) t;

    return to_ret;
END
$func$ language plpgsql;
