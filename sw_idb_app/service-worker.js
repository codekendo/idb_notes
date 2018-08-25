

(function(){

if (typeof idb === "undefined") {
self.importScripts('./idb.js');
}

self.addEventListener('activate', function(event) {
	event.waitUntil(createDB());
});

function createDB() {
	idb.open('products', 1, function(upgradeDB) {
		var store = upgradeDB.createObjectStore('beverages', {
			keyPath: 'id'
		});
		store.put({ id: 123, name: 'coke', price: 10.99, quantity: 200 });
		store.put({ id: 321, name: 'pepsi', price: 8.99, quantity: 100 });
		store.put({ id: 222, name: 'water', price: 11.99, quantity: 300 });
	});
}

function readDB() {
	idb.open('products', 1)
		.then(function(db) {
			var tx = db.transaction(['beverages'], 'readonly');
			var store = tx.objectStore('beverages');
			return store.getAll();
		})
		.then(function(items) {
            // Use beverage data
            jsonObject = {}
            items.foreach((item, i)=>{
                return jsonObject[i] = item 
            })
           return JSON.stringify(jsonObject);
		});
}

function updateDB(json){
    idb.open('products', 1)
    .then(function(db){
        var tx = db.transaction(['beverages', 'readwrite'])
        var store = tx.objectStore('beverages');
        json.map(element => {
            store.put(element)
        });
    })
}



// Intercept fetch events. Target the api that spits out JSON and store it in IDB

var targetJSONURL = "REPLACE ME WITH A REAL JSON API"

self.addEventListener('fetch', function(event){
if (event.request.url === targetJSONURL){
    event.respondWith(
        readDB()
    );
}
})









})()