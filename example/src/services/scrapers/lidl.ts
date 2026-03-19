/**
 * Lidl.hu extraction script — injected into WebView after page loads.
 * Waits for Vue.js to render product data, then extracts it from the DOM.
 */
export const LIDL_EXTRACTION_SCRIPT = `
(function() {
  function extractProducts() {
    var products = [];

    // Try product grid items (search/category pages)
    var gridItems = document.querySelectorAll('.s-grid-box, [class*="AProductGridbox"], [class*="product-grid-box"], article[class*="product"]');
    gridItems.forEach(function(item) {
      var nameEl = item.querySelector('[class*="product-title"], [class*="grid-box__title"], h3, h2, [class*="name"]');
      var priceEl = item.querySelector('[class*="price"], [class*="pricebox__price"], [class*="m-price"]');
      var imgEl = item.querySelector('img[src*="lidl"], img[data-src], img');
      var linkEl = item.querySelector('a[href*="/p/"]');

      if (nameEl && priceEl) {
        var priceText = priceEl.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
        var price = parseFloat(priceText);
        if (!isNaN(price)) {
          products.push({
            name: nameEl.textContent.trim(),
            price: Math.round(price * 100),
            imageUrl: imgEl ? (imgEl.src || imgEl.dataset.src || null) : null,
            url: linkEl ? linkEl.href : window.location.href,
          });
        }
      }
    });

    // Try single product page
    if (products.length === 0) {
      var title = document.querySelector('[class*="product-title"], [class*="keyfacts__title"], h1');
      var price = document.querySelector('[class*="m-price__price"], [class*="pricebox__price"], [class*="price--action"], [class*="price"]');

      if (title && price) {
        var priceText = price.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
        var priceVal = parseFloat(priceText);
        if (!isNaN(priceVal)) {
          var img = document.querySelector('[class*="product-image"] img, [class*="gallery"] img, meta[property="og:image"]');
          products.push({
            name: title.textContent.trim(),
            price: Math.round(priceVal * 100),
            imageUrl: img ? (img.src || img.content || null) : null,
            url: window.location.href,
          });
        }
      }
    }

    // Fallback: try JSON-LD
    if (products.length === 0) {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(function(s) {
        try {
          var data = JSON.parse(s.textContent);
          if (data['@type'] === 'Product' || (data['@graph'] && data['@graph'].find(function(i) { return i['@type'] === 'Product'; }))) {
            var prod = data['@type'] === 'Product' ? data : data['@graph'].find(function(i) { return i['@type'] === 'Product'; });
            var offer = prod.offers || (prod.offers && prod.offers[0]);
            var offerPrice = offer ? (offer.price || offer.lowPrice) : null;
            if (prod.name && offerPrice) {
              products.push({
                name: prod.name,
                price: Math.round(parseFloat(offerPrice) * 100),
                imageUrl: prod.image ? (typeof prod.image === 'string' ? prod.image : prod.image[0]) : null,
                url: window.location.href,
              });
            }
          }
        } catch(e) {}
      });
    }

    return products;
  }

  // Wait for Vue/Nuxt to render (products appear asynchronously)
  var attempts = 0;
  var maxAttempts = 20;

  function tryExtract() {
    attempts++;
    var products = extractProducts();
    if (products.length > 0 || attempts >= maxAttempts) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'products',
        data: products,
        url: window.location.href,
        store: 'Lidl',
      }));
    } else {
      setTimeout(tryExtract, 500);
    }
  }

  // Start after a short delay to let initial rendering happen
  setTimeout(tryExtract, 1500);
})();
`;
