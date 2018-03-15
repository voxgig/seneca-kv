# seneca-kv
[Seneca](senecajs.org) plugin providing messages for a generic key-value store.


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

### `role:kv,cmd:set`; params: `key`: string, `val`: object
### `role:kv,cmd:get`; params: `key`: string
### `role:kv,cmd:del`; params: `key`: string
