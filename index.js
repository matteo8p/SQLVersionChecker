const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

function main()
{
  const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;
  console.log(GITHUB_WORKSPACE);
}

main();



