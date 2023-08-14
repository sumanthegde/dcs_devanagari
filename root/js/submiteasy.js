var searchForm = document.querySelector('form[name="basic"]');
if(searchForm){
    searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("adding interceptor..");
    var wordInput = document.getElementById('word_input');
    if (wordInput) {
      var userInput = wordInput.value;
      var transformedValue = Sanscript.t(userInput,'devanagari','iast');
      wordInput.value = transformedValue;
    }
    event.target.submit();
  });


  var labelElement = document.querySelector('label[for="word_input"]');
  if (labelElement) {
    var devanagariTextNode = document.createTextNode(' / देवनागरी ');
    var anchorElement = labelElement.querySelector('a');
    if (anchorElement) {
      labelElement.insertBefore(devanagariTextNode, anchorElement.nextSibling);
    }
  }
}

