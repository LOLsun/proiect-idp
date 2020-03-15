# Docs about the different types of blocks

## Block types

Content block types:

 - [x] Text
 - [ ] Page
 - [x] TODO block
 - [x] Headings
   - [x] Heading level 1
   - [x] Heading level 2
   - [x] Heading level 3
 - [x] Bullet list element
 - [x] Numbered list element
 - [ ] Spoiler/Content Toggle
 - [ ] Quote
 - [ ] Divider
 - [ ] Callout
 - [ ] Link
 - [ ] Image
 - [ ] Video
 - [ ] Audio
 - [ ] Code
 - [ ] File
 - [ ] Math
 - [ ] Table of Contents

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

### Bullet list element

 - content -- a markdown string

### Numbered list element

 - content -- a markdown string
 - index
