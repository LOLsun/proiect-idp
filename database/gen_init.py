#!/usr/bin/env python3
from jinja2 import Environment, FileSystemLoader

blocks = [
    {
        'table_name': 'paragraphs',
        'block_name': 'Paragraph',
        'columns': [
            {
                'name': 'content',
                'type': 'varchar',
            },
        ]
    },
    {
        'table_name': 'todos',
        'block_name': 'To-Do',
        'columns': [
            {
                'name': 'content',
                'type': 'varchar',
            },
            {
                'name': 'done',
                'type': 'boolean',
            },
        ]
    },
]


if __name__ == '__main__':
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template('init_template.j2')
    print(template.render(blocks=blocks))
