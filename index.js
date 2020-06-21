const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');


function main()
{
  const sql_directory = core.getInput('sql_directory');
  const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

  const srcPath = path.join(GITHUB_WORKSPACE, sql_directory);
  console.log(sql_directory);
  console.log(GITHUB_WORKSPACE);
  console.log(srcPath);
}

main();



