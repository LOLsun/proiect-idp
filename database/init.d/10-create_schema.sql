create table ingredients (
    id int primary key,
    name varchar(50) unique not null,
    picture_url varchar(500) unique not null
);


create table drinks (
    id int primary key,
    name varchar(50) unique not null,
    glass varchar(50),
    instructions varchar(3000) not null,
    picture_url varchar(500) unique not null
);


create table drinks_ingredients(
    drink_id int not null,
    ingredient_id int not null,
    quantity varchar(50),

    primary key (drink_id, ingredient_id, quantity),

    constraint drink_ingredients_fk_drinks foreign key (drink_id)
    references drinks (id),

    constraint drink_ingredients_fk_ingredients foreign key (ingredient_id)
    references ingredients (id)
);

create table categories(
    id int not null,
    name varchar(50) not null,
    parent int,

    primary key (id),

    constraint category_parent_fk foreign key (parent)
    references categories (id)
);


create table drinks_categories(
    drink_id int not null,
    category_id int not null,

    primary key (drink_id, category_id),

    constraint drinks_categories_fk_drinks foreign key (drink_id)
    references drinks (id),

    constraint drinks_categories_fk_categories foreign key (category_id)
    references categories (id)
);


create table web_hits(
    drink_id int not null,
    ts timestamp not null default current_timestamp,

    primary key (drink_id, ts),

    constraint web_hits_fk foreign key (drink_id)
    references drinks (id)
);
