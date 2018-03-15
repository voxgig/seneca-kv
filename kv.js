/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'


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

  const opts = optioner.check(options)
  const utils = intern.make_utils(opts)
  const keymap = {}
  
  return {
    export: {
      make_utils: intern.make_utils
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
  make_utils: function(opts) {
    opts = opts || {}
    
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
  }
}
