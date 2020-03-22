#!/usr/bin/env python3
from prompt_toolkit.application import Application
from prompt_toolkit.key_binding import KeyBindings
from prompt_toolkit.layout import Layout
from prompt_toolkit.document import Document
from prompt_toolkit.widgets import Box, Frame, TextArea, Label
from prompt_toolkit.buffer import Buffer
from prompt_toolkit.styles import Style
from prompt_toolkit.filters import Condition
from prompt_toolkit.application.current import get_app
from prompt_toolkit.layout.containers import (
    VSplit,
    HSplit,
    Window,
    VerticalAlign,
    to_container,
    HorizontalAlign,
    ConditionalContainer,
)
from prompt_toolkit.layout.controls import BufferControl, FormattedTextControl
from sys import stderr
from pprint import pprint


#blocks = [{"id": 1, "block_type": 2, "order_in_page": 1000, "attrs": {"content": "read 10 pages", "done": True}}, {"id": 2, "block_type": 2, "order_in_page": 2000, "attrs": {"content": "finish the book", "done": False}}, {"id": 3, "block_type": 1, "order_in_page": 3000, "attrs": {"content": "Test **paragraph** 1"}}, {"id": 4, "block_type": 1, "order_in_page": 4000, "attrs": {"content": "Test *paragraph* 2"}}]
blocks = [{"id": 1, "block_type": 2, "order_in_page": 1000, "attrs": {"content": "read 10 pages", "done": True}}, {"id": 2, "block_type": 2, "order_in_page": 2000, "attrs": {"content": "finish the book", "done": False}}]


class TodoViewWidget:
    """
    A prompt_toolkit widget to display a TODO block
    """
    def __init__(self, block):
        self.block = block

        self.control = FormattedTextControl(lambda: self.block['attrs']['content'])
        self.checkbox = FormattedTextControl(lambda: '[x]' if block['attrs']['done'] else '[ ]')

        self.container = VSplit(
            [
                Window(
                    self.checkbox,
                    dont_extend_width=True,
                    dont_extend_height=True
                ),
                Window(
                    content=self.control,
                    dont_extend_width=True,
                    dont_extend_height=True
                )
            ],
            padding=1,
            padding_char=' ',
            align=HorizontalAlign.LEFT
        )

    def __pt_container__(self):
        return self.container

    def focus(self):
        get_app().layout.current_control = self.checkbox

class TodoEditWidget:
    """
    a prompt_toolkit widget used to edit a TODO block
    """
    def __init__(self, block, focusable, on_text_changed):
        self.focusable = focusable
        self.block = block
        self.on_text_changed = on_text_changed

        self.buffer = Buffer(
            document=Document(self.block['attrs']['content'], 0),
            on_text_changed=self.on_text_changed
        )

        self.control = BufferControl(
            buffer=self.buffer,
            focusable=self.focusable
        )

        self.container = VSplit(
            [
                Window(
                    FormattedTextControl(lambda: '[x]' if block['attrs']['done'] else '[ ]'),
                    dont_extend_width=True,
                    dont_extend_height=True
                ),
                Window(
                    content=self.control,
                    dont_extend_width=True,
                    dont_extend_height=True
                )
            ],
            padding=1,
            padding_char=' ',
            align=HorizontalAlign.LEFT
        )

    def __pt_container__(self):
        return self.container

    def focus(self):
        get_app().layout.focus(self.control)


class TodoWidget:
    def __init__(self, block):
        self.editable = False
        self.block = block

        def on_text_change(buf):
            self.block['attrs']['content'] = buf.text


        self.view_widget = TodoViewWidget(self.block)
        self.edit_widget = TodoEditWidget(self.block,
                                          Condition(lambda: self.editable),
                                          on_text_change)
        self.container = HSplit(
            [
                ConditionalContainer(content=self.view_widget,
                                     filter=~Condition(lambda: self.editable)),
                edit_widget := ConditionalContainer(content=self.edit_widget,
                                                    filter=Condition(lambda: self.editable))
            ],
        )

    def __pt_container__(self):
        return self.container

    def focus(self):
        if self.editable:
            self.edit_widget.focus()
        else:
            self.view_widget.focus()


#widget = TodoWidget(blocks[0])
widgets = [TodoWidget(b) for b in blocks]
cur_idx = 0

root_container = HSplit(
    [
        #TodoViewWidget(blocks[0]),
        #TodoEditWidget(blocks[0]),
        *widgets
    ],
    padding=1,
    padding_char='~',
    align=VerticalAlign.TOP
)



layout = Layout(container=root_container)
kb = KeyBindings()

@kb.add('c-c')
def _(event):
    event.app.exit()

@kb.add('c-x')
def _(event):
    blocks[cur_idx]['attrs']['done'] = not blocks[cur_idx]['attrs']['done']

@kb.add('c-e')
def _(event):
    widgets[cur_idx].editable = not widgets[cur_idx].editable
    widgets[cur_idx].focus()

@kb.add('>', '>')
def _(event):
    global cur_idx
    cur_idx = min(cur_idx + 1, len(widgets) - 1)
    widgets[cur_idx].focus()

@kb.add('up')
def _(event):
    global cur_idx
    cur_idx = max(cur_idx - 1, 0)
    widgets[cur_idx].focus()

#@kb.add('c-a')
#def _(event):
#    def c():
#        return 'new content'
#    new_member = to_container(Frame(
#                                body=Window(FormattedTextControl(c), height=1),
#                                title='focused',
#                                style='class:inexistent'
#                              )
#                             )
#    root_container.children.append(new_member)
#    #root_container.children.append(Box(body=Window(
#    #        FormattedTextControl('luca scrie cod'), height=1
#    #    )))


app = Application(layout=layout, key_bindings=kb, full_screen=True,
                  style=Style.from_dict({'frame.border': 'ansired',
                                         'new_content': 'ansiyellow blink'}))


def main():
    app.run()


if __name__ == '__main__':
    main()
