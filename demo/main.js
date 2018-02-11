;(function() {
  'use strict';

  var schemaUrlForm = document.getElementById('schema-url-form');
  var schemaUrlInput;

  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
    url = window.__REDOC_DEV__ ? url : '\\\\cors.apis.guru/' + url;
    document.getElementsByTagName('redoc')[0].setAttribute('spec-url',  url);
  }

  function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
      var hash =  '';
      if( uri.indexOf('#') !== -1 ){
          hash = uri.replace(/.*#/, '#');
          uri = uri.replace(/#.*/, '');
      }
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      return uri + separator + key + "=" + value + hash;
    }
  }

  var specs = document.querySelector('#specs');
  specs.addEventListener('dom-change', function() {
    schemaUrlForm = document.getElementById('schema-url-form');
    schemaUrlInput = document.getElementById('schema-url-input');

    schemaUrlForm.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      location.search = updateQueryStringParameter(location.search, 'url', schemaUrlInput.value)
      return false;
    })

    schemaUrlInput.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    schemaUrlInput.value = url;
    specs.specs = [
      'https://api.apis.guru/v2/specs/instagram.com/1.0.0/swagger.yaml',
      'https://api.apis.guru/v2/specs/googleapis.com/calendar/v3/swagger.yaml',
      'https://api.apis.guru/v2/specs/data2crm.com/1/swagger.yaml',
      'https://api.apis.guru/v2/specs/graphhopper.com/1.0/swagger.yaml'
    ];

    var $specInput = document.getElementById('spec-input');

    $specInput.addEventListener('value-changed', function(e) {
      schemaUrlInput.value = e.detail.value;
      location.search = updateQueryStringParameter(location.search, 'url', schemaUrlInput.value);
    });

    function selectItem() {
      let value = this.innerText.trim();
      schemaUrlInput.value = value;
      location.search = updateQueryStringParameter(location.search, 'url', schemaUrlInput.value);
    }

    // for some reason events are not triggered so have to dirty fix this
    $specInput.addEventListener('click', function(event) {
      let $elems = document.querySelectorAll('.item.vaadin-combo-box-overlay');
      $elems.forEach(function($el) {
        $el.addEventListener('mousedown', selectItem);
        $el.addEventListener('mousedown', selectItem);
      });
    });
    // demo codes from https://developer.chrome.com/devtools/docs/heap-profiling-dom-leaks to show detached dom
    console.log('Add detached nodes');
    var detached = document.createElement("div");
     $specInput.appendChild(detached);
     $specInput.removeChild(detached);
    for (var i = 0; i < 100; ++i) {
      var div = document.createElement('div');
      div.data = new Array(10000);
      for (var j = 0, l = div.data.length; j < l; ++j)
        div.data[j] = j.toString();
      detached.appendChild(div);
    }

    console.log('add sessionstorage by main.js');
    var dateTime = new Date().getTime();
    for(var i=0;i<5000;i++) {
      sessionStorage.setItem(`sessionStorageKey${i}${dateTime}`,`sessionStorage1${i}${dateTime} hello world`);
    }

    console.log('add localstorage by main.js');
    for(var j=0; j<5000; j++) {
      localStorage.setItem(`localStorageStorageKey${j}${dateTime}`,`localStorage1${j}${dateTime} hello world`);
    }
    console.log('add IndexedDB by main.js');
    var db = new Dexie("test");
    db.version(1).stores({
      raindrops: '++id,position'
    });
    var drops = [];
    var total = 5000;
    for (var k=0;k<total;++k) {
      drops.push({position: `position${k}${dateTime}`});
    }
    db.raindrops.bulkAdd(drops).then(function(lastKey) {
      console.log(`Done adding ${total} raindrops all over the place`);
      console.log("Last raindrop's id was: " + lastKey);
    }).catch(Dexie.BulkError, function (e) {
      // Explicitely catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      console.error ("Some raindrops did not succeed. However, " +
        total-e.failures.length + " raindrops was added successfully");
    });

  });
})();
