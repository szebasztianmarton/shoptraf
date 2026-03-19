/**
 * Generic extraction script — works on most e-commerce sites.
 * Tries JSON-LD first, then Open Graph, then common DOM patterns.
 */
export const GENERIC_EXTRACTION_SCRIPT = `
(function() {
  function extractProduct() {
    // 1. Try JSON-LD structured data (most reliable)
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var products = [];
        if (Array.isArray(data)) products = data;
        else if (data['@graph']) products = data['@graph'];
        else products = [data];

        for (var j = 0; j < products.length; j++) {
          var item = products[j];
          if (item['@type'] === 'Product' && item.name) {
            var offer = item.offers;
            if (Array.isArray(offer)) offer = offer[0];
            var price = offer ? (offer.price || offer.lowPrice) : null;
            if (price) {
              return {
                name: item.name,
                price: Math.round(parseFloat(price) * 100),
                imageUrl: item.image ? (typeof item.image === 'string' ? item.image : item.image[0]) : null,
                url: window.location.href,
              };
            }
          }
        }
      } catch(e) {}
    }

    // 2. Try Open Graph meta tags
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogPrice = document.querySelector('meta[property="product:price:amount"], meta[property="og:price:amount"]');
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogTitle && ogPrice) {
      return {
        name: ogTitle.content,
        price: Math.round(parseFloat(ogPrice.content) * 100),
        imageUrl: ogImage ? ogImage.content : null,
        url: window.location.href,
      };
    }

    // 3. Try common price patterns in DOM
    var title = document.querySelector('h1, [class*="product-title"], [class*="product-name"], [itemprop="name"]');
    var priceEl = document.querySelector('[itemprop="price"], [class*="product-price"], [class*="current-price"], [class*="price--current"], [data-price]');
    var image = document.querySelector('[itemprop="image"], [class*="product-image"] img, [class*="gallery"] img');

    if (title && priceEl) {
      var priceAttr = priceEl.getAttribute('content') || priceEl.dataset.price;
      var priceText = priceAttr || priceEl.textContent;
      priceText = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
      var priceVal = parseFloat(priceText);
      if (!isNaN(priceVal)) {
        return {
          name: title.textContent.trim(),
          price: Math.round(priceVal * 100),
          imageUrl: image ? (image.src || image.content) : null,
          url: window.location.href,
        };
      }
    }

    // 4. Fallback: page title + any price-like pattern
    var pageTitle = document.title;
    var allText = document.body.innerText;
    var priceMatch = allText.match(/(\\d[\\d\\s.,]*\\d)\\s*(Ft|HUF|forint)/i);
    if (pageTitle && priceMatch) {
      var rawPrice = priceMatch[1].replace(/\\s/g, '').replace(',', '.');
      var parsedPrice = parseFloat(rawPrice);
      if (!isNaN(parsedPrice)) {
        return {
          name: pageTitle.split('|')[0].split('-')[0].trim(),
          price: Math.round(parsedPrice * 100),
          imageUrl: ogImage ? ogImage.content : null,
          url: window.location.href,
        };
      }
    }

    return null;
  }

  var attempts = 0;
  var maxAttempts = 15;

  function tryExtract() {
    attempts++;
    var product = extractProduct();
    if (product || attempts >= maxAttempts) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'products',
        data: product ? [product] : [],
        url: window.location.href,
        store: new URL(window.location.href).hostname.replace('www.', ''),
      }));
    } else {
      setTimeout(tryExtract, 500);
    }
  }

  setTimeout(tryExtract, 1000);
})();
`;
