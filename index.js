const core = require('@actions/core');
const github = require('@actions/github');

const nameToGreet = core.getInput('name');

if(nameToGreet.valueOf() === "Matthew".valueOf())
{
  console.log("Hello Matthew!");
}else
{
  core.setFailed("Error!");
}

