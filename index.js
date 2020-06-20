const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const nameToGreet = core.getInput('name');
const repo = core.getInput('GITHUB_REPOSITORY');

console.log("Hey there " + nameToGreet);
console.log("You are currently in this Depository: " + repo);



