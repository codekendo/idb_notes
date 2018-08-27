# idb_notes

## Description

This just IDB notes.

IDB is indexed database that is built into the browser.

It is a nosql type of DB that is event driven.

I will bbe messing with a promised based version of IDB.



## Check for IDB


```javascript
if (!('indexedDB' in window)) {
  console.log('This browser doesn\'t support IndexedDB');
  return;
}

```
---

## Create a DB



`var dbPromise = idb.open('couches-n-things', 1);`

`idb.open(name, version, upgradeCallback)`


---

## Delete a db 

chrome dev tools < application pane < clear storage or IDB delete storage

`indexedDB.deleteDatabase('couches-n-things')`



## Creating an object store 

```javascript

var dbPromise = idb.open('couches-n-things', 2, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
    case 1:
      console.log('Creating the products object store');
      upgradeDb.createObjectStore('products', {keyPath: 'id'});

  }
});
```

keypath is like primary key. Once created you do not have to use value key syntax.

### adding items/objects to the object store


```javascript
dbPromise.then(function(db) {
  var tx = db.transaction('products', 'readwrite');
  var store = tx.objectStore('products');
  var items = [
    {
      name: 'Couch',
      id: 'cch-blk-ma',
      price: 499.99,
      color: 'black',
      material: 'mahogany',
      description: 'A very comfy couch',
      quantity: 3
    },
    // ... items

  ];
  return Promise.all(items.map(function(item) {
      console.log('Adding item: ', item);
      return store.add(item);
    })
  ).catch(function(e) {
    tx.abort();
    console.log(e);
  }).then(function() {
    console.log('All items added successfully!');
  });
});

```

After you open the IDB. You have to create a transaction/operation.
`readwrite` is meant for `put`, `delete` and `add` operations.

The `Promise.all()` will wait for all the async events to complete.
If any fails the whole transaction will fail.



--- 

### Creating an index

```javascript

var dbPromise = idb.open('couches-n-things', 2, function(upgradeDb) {
	switch (upgradeDb.oldVersion) {
		case 0:
			// a placeholder case so that the switch block will
			// execute when the database is first created
			// (oldVersion is 0)
		case 1:
			console.log('Creating the products object store');
			upgradeDb.createObjectStore('products', { keyPath: 'id' });
			// TODO 4.1 - create 'name' index
			// TODO 4.2 - create 'price' and 'description' indexes
      // TODO 5.1 - create an 'orders' object store
    case 2:
      console.log('Creating a name index');
      var store = upgradeDb.transaction.objectStore('products');
      store.createIndex('name', 'name', { unique: true });
	}
});
```

Note on case this how we create an index for the object store.


---

### This shows how to use the idb cursor

Note you use the class IDBKeyRange to create range of values.

```javascript
var lower = document.getElementById('priceLower').value;
var upper = document.getElementById('priceUpper').value;
var lowerNum = Number(document.getElementById('priceLower').value);
var upperNum = Number(document.getElementById('priceUpper').value);

if (lower === '' && upper === '') {return;}
var range;
if (lower !== '' && upper !== '') {
  range = IDBKeyRange.bound(lowerNum, upperNum);
} else if (lower === '') {
  range = IDBKeyRange.upperBound(upperNum);
} else {
  range = IDBKeyRange.lowerBound(lowerNum);
}
var s = '';
dbPromise.then(function(db) {
  var tx = db.transaction('products', 'readonly');
  var store = tx.objectStore('products');
  var index = store.index('price');
  return index.openCursor(range);
}).then(function showRange(cursor) {
  if (!cursor) {return;}
  console.log('Cursored at:', cursor.value.name);
  s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
  for (var field in cursor.value) {
    s += field + '=' + cursor.value[field] + '<br/>';
  }
  s += '</p>';
  return cursor.continue().then(showRange);
}).then(function() {
  if (s === '') {s = '<p>No results.</p>';}
  document.getElementById('results').innerHTML = s;
});

```


---

### Using cursor for a keyword that 
```javascript

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') {return;}
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('description');
      return index.openCursor(range);
    })
    .then(function showRange(cursor) {
    		if (!cursor) { return; }
    		console.log('Cursored at:', cursor.value.name);
    		s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
    		for (var field in cursor.value) {
    			s += field + '=' + cursor.value[field] + '<br/>';
    		}
    		s += '</p>';
    		return cursor.continue()
    			.then(showRange);
    	})
    	.then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }
```

New Section from Offline Course.

--- 

## Notes on keyValueStores

This is a bit different from other dbs.
Note Value, Key Syntax.
This example shows how you create a db and a object store.

```javascript
import idb from 'idb';

var dbPromise = idb.open('test-db', 1, function(upgradeDb){
  var keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put('world', 'hello');
})
```


```javascript

dbPromise.then(function(db) {
	var tx = db.transaction("keyval");
	var keyValStore = tx.objectStore('keyval');
	return keyValStore.get('hello')
		.then(val => console.log('this is the value', val))
})

// returns `world` to the console

```




---

# PWA training section

## Sw and IDB 

Note use IDB on the activate event so you only create it once.

sw.js
```javascript

self.addEventListener('activate', function(e) {
	e.waitUntil(createDB());
});

function createDB(){
  productsDB = idb.open('products', 1, upgradeDB => {
    var store = upgradeDB.crateObjectStore('clothing', {
      keyPath:'id'
    });
    store. put({
      id:123,
      name:'jacket',
      price:50.20,
      quanity:20
    });
  }) 
}

```
Cache Event on the install event
```javascript

self.addEventListener('install', function(event){
  event.waitUntil(
    cacheAssets()
  );
});

cacheAssets() => {
  return caches.open('cache').then(cache=>cache.addAll([
    'index.html',
    'styles/main.css',
    'js/offline.js',
    'img/jacket.jpg'
  ]))
}
```
getting data for ui

```javascript
readDB()=>{
  productsDB.then(
    db=>{
      db.transaction(['clothing'], 'readonly')
    }
  )
}
```




---

## Example of Deleting posts and keeping the 30 newest posts from an index of by-date
This goes backwards assuming that 30 newest posts are at the bottom.
Open cursor opens the cursor at the bottom goes up 30 posts.


```javascript
store.index('by-date').openCursor(null, 'prev')
  .then(cursor => cursor.advance(30))
  .then(deleteRest(cursor)=>{
    if(!cursor) return;
    cursor.delete();
    return cursor.continue().then(deleteRest)
  })
;
```


