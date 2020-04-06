GET /blocks
 - returns all blocks (for now, will add page as a parameter

GET /blocks/<int:block_id>
 - returns the block with id `block_id`

POST /blocks
 - expects an object with the following shape
   {
       'block': {
           'block_type': ...,
           'attrs': {
               ...
           }
       },
       'add_before': <id>
       OR
       'add_after': <id>
       ['parent': <id>]
   }
 - if neither `add_before` nor `add_after` are included, the
    new block is added at the end
 - returns either:
     - status 201 + json representing the block in case of success
     - status 400 otherwise
 - in case of success, the `order_in_page` attribute of any element
   may have changed; this should pose no problems. to refresh the
   ordering, see `GET /order/<list:block_ids>`

DELETE /blocks/<int:block_ids>

DELETE /blocks/<int:block_id>/children

TODO implement
PUT /blocks/<int:block_id>
    - expects an object with the following shape
       {
           'block_type': ...,
           'attrs': {
               ...
           }
       }
    - returns either:
        - status 200 + json representing the block in case of success
        - status 400 otherwise

TODO implement
PUT /blocks/move/<int:to_move_id>/before/<int:target_id>

TODO implement
PUT /blocks/move/<int:to_move_id>/after/<int:target_id>

TODO implement
PUT /blocks/move/<int:to_move_id>/as_child_of/<int:target_id>
    - should only be called if target_id doesn't have any children yet

TODO implement
GET /order/<list:block_ids>
    - returns just the `order_in_page` attribute of all inputs

TODO implement
GET /blocktypes
    - returns the names of all block types (for example 1 means Paragraph, 2 means To-Do etc.)

