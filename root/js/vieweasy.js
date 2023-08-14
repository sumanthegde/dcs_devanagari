
function textReplace(classNames) {
  classNames.forEach(function(className) {
    var elements = document.querySelectorAll("." + className);
    console.log("className: " , className, elements.length);
    elements.forEach(function(element) {
      console.log("HERE: ", element.className);
      // Loop through child nodes and apply translit to text nodes
      Array.from(element.childNodes).forEach(function(node) {
        if(node.nodeType === Node.TEXT_NODE 
             || node.nodeType == Node.ELEMENT_NODE && node.tagName.toUpperCase() === 'STRONG'
             || node.nodeType == Node.ELEMENT_NODE && node.tagName.toUpperCase() === 'SPAN'
          ) {
          var cur = node.textContent;
          var transed = Sanscript.t(cur, 'iast', 'devanagari');
          node.textContent = transed;
        }
      });
    });
  });
}

// List of class names to target
var classList = ["sentence_div", "sentence_with_reference", "text-lemma-link"];

// Call the textReplace function with class names and transformation function
textReplace(classList);

// Create a MutationObserver
var observer = new MutationObserver(function(mutationsList) {
  // Call your function to reapply transformations after DOM changes (e.g., AJAX)
  textReplace(classList);
});

// Configure the observer to watch for childList mutations
observer.observe(document.body, { childList: true, subtree: true });
