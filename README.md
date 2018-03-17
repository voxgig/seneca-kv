# seneca-kv
[Seneca](senecajs.org) plugin providing messages for a generic key-value store.

[![Npm][BadgeNpm]][Npm]
[![NpmFigs][BadgeNpmFigs]][Npm]
[![Travis][BadgeTravis]][Travis]
[![Coveralls][BadgeCoveralls]][Coveralls]


## Quick Example

```
Seneca()
  .use('kv')
  .act('role:kv,cmd:set,key:foo,val:bar', function() {
    this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
      console.log(out.val) // prints 'bar'
    })
  })
```


## Inbound Messages

* `role:kv,cmd:set`; params: `key`: string, `val`: object
* `role:kv,cmd:get`; params: `key`: string
* `role:kv,cmd:del`; params: `key`: string


## Implementations

* Self: transient memory store
* Redis: [`seneca-redis-kv`](https://github.com/voxgig/seneca-redis-kv)


[BadgeCoveralls]: https://coveralls.io/repos/voxgig/seneca-kv/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/seneca-kv.svg
[BadgeNpmFigs]: https://img.shields.io/npm/dm/seneca-kv.svg?maxAge=2592000
[BadgeTravis]: https://travis-ci.org/voxgig/seneca-kv.svg?branch=master
