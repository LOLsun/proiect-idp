#!/bin/bash

# Variable

BASE_URL="http://localhost:5000/"

read -r -d '' TEST1_POST_DATA << END_OF_JSON
{
    "block": {
        "block_type": 1,
        "attrs": {
            "content": "after everything"
        }
    }
}
END_OF_JSON

read -r -d '' TEST2_POST_DATA << END_OF_JSON
{
    "block": {
        "block_type": 2,
        "attrs": {
            "content": "todo before 2",
            "done": true
        }
    },
    "add_before": 2
}
END_OF_JSON

read -r -d '' TEST3_POST_DATA << END_OF_JSON
{
    "block": {
        "block_type": 1,
        "attrs": {
            "content": "paragraph after 3"
        }
    },
    "add_after": 3
}
END_OF_JSON

# Functions

add_block() {
    data=$1

    curl 2>/dev/null \
         -X POST \
         -H 'Content-Type: Application/Json' \
         --data "$data" \
         "$BASE_URL/blocks"
}

# Tests

echo "Test 1: adding a block without specifying a position"
add_block "$TEST1_POST_DATA"

echo "Test 2: adding a block before another block"
add_block "$TEST2_POST_DATA"

echo "Test 3: adding a block after another block"
add_block "$TEST3_POST_DATA"
