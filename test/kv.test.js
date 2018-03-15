/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')


lab.test('validate', PluginValidator(Plugin, module))

lab.test('happy', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .act('role:kv,cmd:set,key:foo,val:bar', function() {
      this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
        expect(out.val).equal('bar')
        fin()
      })
    })
})


lab.test('basic', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      this
        .act('role:kv,cmd:set,key:k1,val:v1')
        .act('role:kv,cmd:set,key:k2,val:v2', function() {
          this
            .act('role:kv,cmd:get,key:k1', function(ignore, out) {
              expect(out.val).equal('v1')
            })
            .act('role:kv,cmd:get,key:k2', function(ignore, out) {
              expect(out.val).equal('v2')
            })
            .act('role:kv,cmd:del,key:k1', function(ignore) {
              this
                .act('role:kv,cmd:get,key:k1', function(ignore, out) {
                  expect(out.val).equal(null)
                })
                .act('role:kv,cmd:get,key:k2', function(ignore, out) {
                  expect(out.val).equal('v2')
                  fin()
                })
            })
        })
    })
})


lab.test('json', fin => {
  Seneca()
    .test(fin)
    .use('..', {})
    .ready(function() {
      this.act('role:kv,cmd:set,key:foo', {val:{a:1}}, function() {
        this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
          expect(out.val).contains({a:1})
          with_json()
        })
      })
    })

  function with_json() {
    Seneca()
      .test(fin)
      .use('..', {json:true})
      .ready(function() {
        const obj = Object.create(
          null,
          // x won't make it past JSON.stringify
          { x: { value: 1, enumerable: false },  
            y: { value: 2, enumerable: true } })


        this.act('role:kv,cmd:set,key:foo', {val:obj}, function() {
          this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
            expect(out.val).contains({y:2})
            fin()
          })
        })
      })
  }

  function without_json() {
    Seneca()
      .test(fin)
      .use('..', {json:false})
      .ready(function() {
        const obj = Object.create(
          null,
          { x: { value: 1, enumerable: false },
            y: { value: 2, enumerable: true } })

        this.act('role:kv,cmd:set,key:foo', {val:obj}, function() {
          this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
            expect(out.val).contains({x:1,y:2})
            fin()
          })
        })
      })
  }

})


lab.test('export', fin => {
  Seneca()
    .test(fin)
    .use('..')
    .ready(function() {
      var kv = this.export('kv')
      expect(kv).exist()

      var kvutils = kv.make_utils({json:true})
      expect(kvutils.encode).exist()
      expect(kvutils.decode).exist()

      expect(kvutils.encode('a')).equals('"a"')
      expect(kvutils.decode('"a"')).equals('a')
      
      fin()
    })
})


lab.test('intern', fin => {
  const mu = Plugin.intern.make_utils({json:true})

  expect(mu.encode(null)).equal('null')
  expect(mu.encode(void 0)).equal('null')
  expect(mu.encode(NaN)).equal('null')
  
  expect(mu.encode('a')).equal('"a"')
  expect(mu.encode(1)).equal('1')
  expect(mu.encode({a:1})).equal('{"a":1}')

  expect(mu.decode('null')).equal(null)
  expect(mu.decode('"null"')).equal('null')
  expect(mu.decode(null)).equal(null)
  expect(mu.decode(void 0)).equal(null)
  expect(mu.decode(NaN)).equal(null)
  
  expect(mu.decode('"a"')).equal('a')
  expect(mu.decode('1')).equal(1)
  expect(mu.decode('{"a":1}')).equal({a:1})

  expect(mu.decode('{"a":}')).startsWith('[INVALID-JSON: Unexpected token')

  const circle = {}
  circle.circle = circle
  expect(mu.encode(circle)).equal('{"circle":"[Circular ~]"}')


  const munj = Plugin.intern.make_utils({json:false})
  expect(munj.encode({a:1})).equal({a:1})
  expect(munj.decode('{"a":1}')).equal('{"a":1}')

  const muno = Plugin.intern.make_utils()
  expect(muno.encode({a:1})).equal({a:1})
  expect(muno.decode('{"a":1}')).equal('{"a":1}')
  expect(muno.encode(null)).equal(null)
  expect(muno.encode(void 0)).equal(null)
  expect(muno.encode(NaN)).equal(null)

  fin()
})


/*
lab.test('async/await', fin => {
  async function foo() {
    const s0 = Seneca()
          .test('print',fin)
          .use('..')

    s0.send = Util.promisify(s0.act)

    s0.act('role:kv,cmd:set,key:foox,val:barx')
    
    var out
    await s0.send('role:kv,cmd:set,key:foo,val:bar')
    out = await s0.send('role:kv,cmd:get',{key:'foo'})
    console.log(out)
    fin()
  }
  foo()
})
*/
