// global variable, must be replaced!
api_key = "";

function pagers(pagination) {
  var criteria = document.getElementById('etsy_criteria').value;
  var pre = pagination.effective_offset - pagination.effective_limit;
  var nxt = pagination.next_offset || 0;
  document.getElementById('pre').setAttribute('href', '#/criteria/' + (pre >= 0 ? pre : 0) + '/' + criteria);
  document.getElementById('nxt').setAttribute('href', '#/criteria/' + nxt + '/' + criteria);;
}

function items(results) {
  if(results.length > 0) {
    // loop through results and create images
    var j = 0;
    var holder;
    for(var i = 0; i < results.length; i++) {
      if(j % 12 === 0) {
        holder = document.createElement('div');
        holder.className = 'row';
        document.getElementById('etsy_images').appendChild(holder);
      }
      var item = document.createElement('div');
      item.className = 'col-xs-12 col-sm-12 col-md-6 col-lg-2 col-xl-1 text-center';
      var img_a = document.createElement('a');
      img_a.setAttribute('href', 'https://www.etsy.com/listing/' + results[i].listing_id);
      var img = document.createElement('img');
      img.setAttribute('src', results[i].Images[0].url_75x75);
      img.setAttribute('alt', results[i].description);
      item.appendChild(img_a).appendChild(img);

      var price_holder = document.createElement('div');
      var price = document.createTextNode('$' + results[i].price);
      item.appendChild(price_holder).appendChild(price);

      var title_holder = document.createElement('div')
      var title_a = document.createElement('a');
      title_a.setAttribute('href', 'https://www.etsy.com/listing/' + results[i].listing_id);
      // only shows up to first 20 letters to avoid long title
      var txt = results[i].title.length > 20 ? (results[i].title.substring(0,17) + '...') :  results[i].title;
      var title = document.createTextNode(txt);
      item.appendChild(title_holder).appendChild(title_a).appendChild(title);

      holder.appendChild(item);
      j++;
    }
  } else {
    // display no results
    document.getElementById("etsy_images").innerHTML = 'no result';
  }
}

function showResults(data) {
  // clear old content
  document.getElementById('etsy_images').innerHTML = '';
  if(data.ok) {
    document.getElementById('etsy_errors').className = 'hidden';
    document.getElementById('etsy_errors').innerHTML = '';
    items(data.results);
    pagers(data.pagination);
  } else {
    document.getElementById('etsy_errors').className = 'alert alert-danger';
    document.getElementById('etsy_errors').innerHTML = data.error;
  }
}

function jsonp(url, callback) {
  var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  var script = document.createElement('script');
  script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
  document.body.appendChild(script);
}

function search() {
  var criteria = document.getElementById('etsy_criteria').value;
  window.location.hash = '#/criteria/0/' + criteria;
  return false;
}

function getListings(criteria, offset) {
  offset = offset || 0;
  if(api_key !== '') {
    var etsyURL = "https://openapi.etsy.com/v2/listings/active.js?keywords=" +
      criteria +
      "&fields=listing_id,title,price&&limit=24&includes=Images(url_75x75,hex_code)&api_key=" +
      api_key +
      "&offset=" + 
      offset +
      "&callback=showResults";
    jsonp(etsyURL, showResults);
  } else {
    showResults({ok:false, error: 'You must replace the api_key with yours'});
  }
}

function router() {
  if(location.hash.substr(0, 11) === '#/criteria/') {
    var offset2criteria = location.hash.indexOf('/', 11);
    if(offset2criteria < 0) {
      window.location.hash = '';
    } else {
      var offset = location.hash.substring(11, offset2criteria);
      var criteria = location.hash.substring(offset2criteria + 1);
      getListings(criteria, offset);
    }
  } else {
    window.location.hash = '';
  }
}

window.onhashchange = router;
document.addEventListener('DOMContentLoaded', router, false);
window.addEventListener('load', router, false );

