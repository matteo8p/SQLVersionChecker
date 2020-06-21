const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');

const sql_directory = core.getInput('sql_directory');
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

const srcPath = path.join(GITHUB_WORKSPACE, sql_directory);
console.log(sql_directory);
console.log(GITHUB_WORKSPACE);
console.log(srcPath);

fs.readdir(GITHUB_WORKSPACE, function (err, files) {
  //handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  //listing all files using forEach
  files.forEach(function (file)
  {
    console.log(file);
  });
});

core.info('Finished Running');




