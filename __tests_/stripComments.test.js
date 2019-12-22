"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
function testStrip(description, query, expected) {
    test(description, () => expect(src_1.stripComments(query)).toBe(expected));
}
testStrip('no comments and no string literals', 'T | count', 'T | count');
testStrip('no comments, simple string litereal', 'print "what"', 'print "what"');
testStrip('no comments, double-quote string literal with single quote inside', 'print "wh\'a\'t"', 'print "wh\'a\'t"');
testStrip('no comments, single-quote string literal with double quote inside', 'print \'wh"a"t\'', 'print \'wh"a"t\'');
testStrip('comment in end of line', 'T | count // some comment', 'T | count ');
testStrip('empty string', '', '');
testStrip('single char', 'a', 'a');
testStrip('single slash', '/', '/');
testStrip('single quote', "'", "'");
testStrip('double quote', '"', '"');
testStrip('double quote  in escape', '"\\', '"\\');
testStrip('single quote  in escape', "'\\", "'\\");
testStrip('do not strip block comments', '/* */', '/* */');
testStrip('only comment', '// what is this', '');
testStrip('comment in separate line', '// this is a comment\nStormEvents | count', 'StormEvents | count');
testStrip('line comment, then query, then another line comment', '// comment\nT | count\n// comment2', 'T | count\n');
testStrip('line comment, then query with line comment at the end, then another line comment', '// comment\nT | count // comment 2 \n// comment 3', 'T | count ');
testStrip('more than one newline', 'T|count//what\n\nyo', 'T|count\nyo');
