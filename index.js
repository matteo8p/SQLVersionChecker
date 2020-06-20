const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const nameToGreet = core.getInput('name');
const repo = core.getInput('GITHUB_HEAD_REF');
const master = core.getInput('GITHUB_BASE_REF')

console.log("Hey there " + nameToGreet);
console.log(repo);
console.log(master);



