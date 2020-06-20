const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const nameToGreet = core.getInput('name');
const repo = core.getInput('GITHUB_HEAD_REF');
const master = core.getInput('GITHUB_BASE_REF')

core.debug("Running V.1.1");
console.log("Hola " + nameToGreet);
console.log(repo.valueOf());
console.log(master.valueOf());



