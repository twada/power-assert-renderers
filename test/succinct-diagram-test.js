import test from 'ava';
import baseAssert from 'assert';
import espowerSource from 'espower-source';
import empower from 'empower';
import formatter from 'power-assert-formatter';
import {AssertionRenderer, SuccinctRenderer} from '../index';

function weave (line) {
    var filepath = '/absolute/path/to/project/test/some_test.js';
    var sourceRoot = '/absolute/path/to/project';
    return espowerSource(line, filepath, {sourceRoot: sourceRoot});
}

function runTest (t, expected, body) {
    try {
        body();
        t.fail('AssertionError is not thrown');
    } catch (e) {
        t.is(e.message, expected);
        t.is(e.name, 'AssertionError');
    }
    t.end();
}

const assert = empower(baseAssert, formatter({
    renderers: [
        AssertionRenderer,
        SuccinctRenderer
    ]
}));


test('BinaryExpression of Identifier', t => {
    const expected =
`  
  assert(hoge === fuga)
         |        |    
         "foo"    "bar"
  `;
    runTest(t, expected, () => {
        const hoge = 'foo';
        const fuga = 'bar';
        eval(weave('assert(hoge === fuga);'));
    });
});


test('BinaryExpression of Identifier and Literal', t => {
    const expected =
`  
  assert(hoge === "bar")
         |              
         "foo"          
  `;
    runTest(t, expected, () => {
        const hoge = 'foo';
        eval(weave('assert(hoge === "bar");'));
    });
});


test('BinaryExpression of Literal', t => {
    const expected =
`  
  assert("foo" === "bar")
                         
                         
  `;
    runTest(t, expected, () => {
        eval(weave('assert("foo" === "bar");'));
    });
});


test('BinaryExpression of MemberExpression', t => {
    const expected =
`  
  assert(en.foo === fr.toto)
            |          |    
            "bar"      "tata"
  `;
    runTest(t, expected, () => {
        const en = { foo: 'bar', toto: 'tata' };
        const fr = { toto: 'tata'};
        eval(weave('assert(en.foo === fr.toto);'));
    });
});


test('BinaryExpression of CallExpression', t => {
    const expected =
`  
  assert(en.foo() === fr.toto())
            |            |      
            "bar"        "tata" 
  `;
    runTest(t, expected, () => {
        const en = { foo: () => 'bar' };
        const fr = { toto: () => 'tata' };
        eval(weave('assert(en.foo() === fr.toto());'));
    });
});


test('non-Punctuator BinaryExpression operator', t => {
    const expected =
`  
  assert(foo instanceof Person)
         |              |      
         "bob"          #function#
  `;
    runTest(t, expected, () => {
        function Person (name) { this.name = name; };
        const foo = 'bob';
        eval(weave('assert(foo instanceof Person);'));
    });
});


test('MemberExpression', t => {
    const expected =
`  
  assert(en.foo)
            |   
            false
  `;
    runTest(t, expected, () => {
        const en = { foo: false };
        eval(weave('assert(en.foo);'));
    });
});


test('deep MemberExpression', t => {
    const expected =
`  
  assert(en.foo.bar)
                |   
                false
  `;
    runTest(t, expected, () => {
        const en = { foo: { bar: false } };
        eval(weave('assert(en.foo.bar);'));
    });
});


test('Identifier', t => {
    const expected =
`  
  assert(foo)
         |   
         false
  `;
    runTest(t, expected, () => {
        const foo = false;
        eval(weave('assert(foo);'));
    });
});


test('CallExpression', t => {
    const expected =
`  
  assert(foo(name))
         |         
         false     
  `;
    runTest(t, expected, () => {
        const name = 'bar';
        const foo = (n) => false;
        eval(weave('assert(foo(name));'));
    });
});


test('deep CallExpression', t => {
    const expected =
`  
  assert(en.foo(bar()))
            |          
            false      
  `;
    runTest(t, expected, () => {
        const bar = () => 'baz';
        const en = { foo: (n) => false };
        eval(weave('assert(en.foo(bar()));'));
    });
});
