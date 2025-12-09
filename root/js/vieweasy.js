
(function() {
  "use strict";

  // Marker attribute to track processed nodes
  var PROCESSED_ATTR = 'data-dcs-translit';
  
  // List of class names to target
  var classList = ["sentence_div", "sentence_with_reference", "text-lemma-link"];
  
  // Chunk size for batch processing
  var CHUNK_SIZE = 50;
  
  // Debounce delay for mutation observer (ms)
  var DEBOUNCE_DELAY = 100;

  /**
   * Check if a node should be transliterated
   */
  function shouldProcess(node) {
    return (node.nodeType === Node.TEXT_NODE ||
            (node.nodeType === Node.ELEMENT_NODE && 
             (node.tagName === 'STRONG' || node.tagName === 'SPAN')));
  }

  /**
   * Transliterate a single element's text content
   */
  function transliterateElement(element) {
    // Skip if already processed
    if (element.hasAttribute && element.hasAttribute(PROCESSED_ATTR)) {
      return;
    }
    
    Array.from(element.childNodes).forEach(function(node) {
      if (shouldProcess(node)) {
        var cur = node.textContent;
        // Quick check: skip if already contains Devanagari or is empty
        if (cur && !/[\u0900-\u097F]/.test(cur)) {
          node.textContent = Sanscript.t(cur, 'iast', 'devanagari');
        }
      }
    });
    
    // Mark as processed
    if (element.setAttribute) {
      element.setAttribute(PROCESSED_ATTR, '1');
    }
  }

  /**
   * Process elements in chunks to avoid blocking the main thread
   */
  function processInChunks(elements, index, callback) {
    if (index >= elements.length) {
      if (callback) callback();
      return;
    }
    
    var end = Math.min(index + CHUNK_SIZE, elements.length);
    
    // Process a chunk
    for (var i = index; i < end; i++) {
      transliterateElement(elements[i]);
    }
    
    // Schedule next chunk - use requestIdleCallback if available, else setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(function() {
        processInChunks(elements, end, callback);
      }, { timeout: 100 });
    } else {
      setTimeout(function() {
        processInChunks(elements, end, callback);
      }, 0);
    }
  }

  /**
   * Collect all unprocessed elements matching our class list
   */
  function getUnprocessedElements(root) {
    var elements = [];
    classList.forEach(function(className) {
      var selector = "." + className + ":not([" + PROCESSED_ATTR + "])";
      var found = (root || document).querySelectorAll(selector);
      elements = elements.concat(Array.from(found));
    });
    return elements;
  }

  /**
   * Main function to transliterate content
   */
  function textReplace(root) {
    var elements = getUnprocessedElements(root);
    if (elements.length > 0) {
      console.log("DCS Translit: Processing", elements.length, "elements");
      processInChunks(elements, 0);
    }
  }

  // Debounce utility
  var debounceTimer = null;
  function debounce(fn, delay) {
    return function() {
      var args = arguments;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(function() {
        fn.apply(null, args);
        debounceTimer = null;
      }, delay);
    };
  }

  // Initial processing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      textReplace();
    });
  } else {
    textReplace();
  }

  // Debounced handler for mutations
  var handleMutations = debounce(function(mutations) {
    // Only process if there are added nodes
    var hasNewContent = mutations.some(function(mutation) {
      return mutation.addedNodes.length > 0;
    });
    
    if (hasNewContent) {
      textReplace();
    }
  }, DEBOUNCE_DELAY);

  // Create a MutationObserver
  var observer = new MutationObserver(handleMutations);

  // Configure the observer to watch for childList mutations
  observer.observe(document.body, { childList: true, subtree: true });
})();

