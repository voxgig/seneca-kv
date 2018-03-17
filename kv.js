/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Assert = require('assert')

const Optioner = require('optioner')
const JSS = require('json-stringify-safe')

const Joi = Optioner.Joi

const optioner = Optioner({
  json: Joi.boolean().default(true),
})


module.exports = function kv(options) {
  var seneca = this
  
  seneca
    .add('role:kv,cmd:set', cmd_set)
    .add('role:kv,cmd:get', cmd_get)
    .add('role:kv,cmd:del', cmd_del)

  const utils = intern.make_utils(options)
  const keymap = {}
  
  return {
    export: {
      make_utils: intern.make_utils,
      basic_test: intern.basic_test
    }
  }

  
  function cmd_set(msg, reply) {
    var key = ''+msg.key
    var val = utils.encode(msg.val)
    keymap[key] = val
    reply()
  }

  function cmd_get(msg, reply) {
    var key = ''+msg.key
    var val = keymap[key]
    val = null != val ? utils.decode(val) : null
    reply({key:key, val:val})
  }

  function cmd_del(msg, reply) {
    var key = ''+msg.key
    delete keymap[key]
    reply()
  }
}


const intern = module.exports.intern = {
  make_utils: function(options) {
    const opts = optioner.check(options || {})

    return {
      encode: function (value) {
        const val = (null != value && !Object.is(NaN,value)) ? value : null
        
        if(opts.json) { 
          try {
            return JSON.stringify(val)
          } catch (e) {
            return JSS(val)
          }
        }

        return val
      },

      decode: function (val) {
        if (!val || Object.is(NaN,val)) return null

        if(opts.json) {
          var str = val.toString()

          try {
            return JSON.parse(str)
          } catch (e) {
            return '[INVALID-JSON: '+e.message+': '+str+']'
          }
        }

        return val
      }
    }
  },

  basic_test: function(seneca_instance, fin) {
    seneca_instance
      .act('role:kv,cmd:set,key:k1,val:v1')
      .act('role:kv,cmd:set,key:k2,val:v2', function() {
        this
          .act('role:kv,cmd:get,key:k1', function(ignore, out) {
            Assert.equal(out.val, 'v1', 'key "k1" should have value "v1"')
          })
          .act('role:kv,cmd:get,key:k2', function(ignore, out) {
            Assert.equal(out.val, 'v2', 'key "k2" should have value "v2"')
          })
          .act('role:kv,cmd:get,key:k0', function(ignore, out) {
            Assert.equal(out.val, null, 'key "k0" should have value null')
          })
          .act('role:kv,cmd:del,key:k1', function(ignore) {
            this
              .act('role:kv,cmd:get,key:k1', function(ignore, out) {
                Assert.equal(
                  out.val, null, 'key "k1" should have value null after deletion')
              })
              .act('role:kv,cmd:get,key:k2', function(ignore, out) {
                Assert.equal(
                  out.val, 'v2', 'key "k2" should continue to have value "v2"')
                fin()
              })
          })
      })
  }
}
