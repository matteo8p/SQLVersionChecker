const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const nameToGreet = core.getInput('name');

console.log("Hey there " + nameToGreet);

fs.readdir("./", function(err, items) {
  console.log(items);

  for (var i=0; i<items.length; i++) {
    console.log(items[i]);
  }
});



