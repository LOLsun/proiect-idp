import React from 'react';
import DOMPurify from 'dompurify'
const marked = require('marked');

// adapted from https://github.com/markedjs/marked/issues/1302#issuecomment-407971865
const whitelist = ['paragraph', 'strong', 'em', 'codespan', 'link', 'del', 'text']
const all_features = ['code', 'blockquote', 'html', 'heading', 'hr', 'list', 'listitem', 'paragraph', 'table', 'tablerow', 'tablecell', 'strong', 'em', 'codespan', 'br', 'del', 'link', 'image', 'text']
const blacklist = all_features.filter(item => whitelist.indexOf(item) < 0)

let renderer = new marked.TextRenderer()
const realRenderer = new marked.Renderer()

whitelist.forEach(option => {renderer[option] = realRenderer[option]})
blacklist.forEach(option => {renderer[option] = text => ''})


function MarkdownContent({ text, className }) {
    // adapted from https://stackoverflow.com/questions/34686523/using-marked-in-react/34688574
    const innerhtml = DOMPurify.sanitize(marked(text, { renderer: renderer }))
    return (
        <div
            dangerouslySetInnerHTML={{ __html: innerhtml }}
            className={`markdown-content ${className && className}`}
        />
    )
}

export default MarkdownContent
