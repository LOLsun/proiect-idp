# Docs about the different types of blocks

## Block types

Content block types:

 - [x] Text
 - [x] Page
 - [x] TODO block
 - [x] Heading level 1
 - [x] Heading level 2
 - [x] Heading level 3
 - [x] Bullet list element
 - [x] Numbered list element
 - [x] Spoiler/Content Toggle
 - [x] Quote
 - [x] Divider
 - [x] Callout
 - [x] Link
 - [x] Image
 - [x] Video
 - [x] Audio
 - [x] Code
 - [x] File
 - [x] Math
 - [x] Table of Contents

Layout block types:

 - [ ] TODO

## Block attributes

### Shared attributes

Each block will have the following:

 - block_id
 - parent_id
 - page_id
 - order
 - block_type

### Text

 - content -- a markdown string

### TODO block

 - content -- a markdown string
 - done -- bool

### Headings

 - content -- a markdown string
 - Level -- 1, 2 or 3, representing the importance of the header

### bullet list element

 - content -- a markdown string

### numbered list element

 - content -- a markdown string
 - index

### Spoiler/Content Toggle

 - name -- a markdown string

### Page

 - page_id -- fk to a page

### Quote

 - quote -- a markdown string

### Divider

 - no attributes

### Callout

 - content -- a markdown string
 - type (hint, warning, note etc.)

### Link

 - url

### Image

 - file

### Video

 - file

### Audio

 - file

### Code

 - language
 - content

### File

 - file

### Math

 - content -- LaTeX string

### Table of Contents

 - no extra attributes

