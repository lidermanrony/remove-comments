import { removeComments } from '../src';

function testRemoveComments(description: string, query: string, expected: string) {
    test(description, () => expect(removeComments(query)).toBe(expected));
}
testRemoveComments('no comments and no string literals', 'T | count', 'T | count');

testRemoveComments('no comments, simple string litereal', 'print "what"', 'print "what"');

testRemoveComments(
    'no comments, double-quote string literal with single quote inside',
    'print "wh\'a\'t"',
    'print "wh\'a\'t"'
);

testRemoveComments(
    'no comments, single-quote string literal with double quote inside',
    'print \'wh"a"t\'',
    'print \'wh"a"t\''
);

testRemoveComments('comment in end of line', 'T | count // some comment', 'T | count ');

testRemoveComments('empty string', '', '');

testRemoveComments('single char', 'a', 'a');

testRemoveComments('single slash', '/', '/');

testRemoveComments('single quote', "'", "'");

testRemoveComments('double quote', '"', '"');

testRemoveComments('double quote  in escape', '"\\', '"\\');

testRemoveComments('single quote  in escape', "'\\", "'\\");

testRemoveComments('do not strip block comments', '/* */', '/* */');

testRemoveComments('only comment', '// what is this', '');

testRemoveComments('comment in separate line', '// this is a comment\nStormEvents | count', 'StormEvents | count');

testRemoveComments(
    'line comment, then query, then another line comment',
    '// comment\nT | count\n// comment2',
    'T | count\n'
);

testRemoveComments(
    'line comment, then query with line comment at the end, then another line comment',
    '// comment\nT | count // comment 2 \n// comment 3',
    'T | count '
);

testRemoveComments('more than one newline', 'T|count//what\n\nyo', 'T|count\nyo');
