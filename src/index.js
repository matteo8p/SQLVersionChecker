const core = require('@actions/core');
const github = require('@actions/github');
const moment = require('moment');                     //Date check module

//  INSTANCE VARIABLES
const MASTERSQL = core.getInput("master_sql");
const CURRENTSQL = core.getInput("current_sql");
const YEAR = core.getInput("year");

var master_list = MASTERSQL.split(' ');
var current_list = CURRENTSQL.split(' ');


//INPUT: none
//OUTPUT: Array of SQL files
//Scans for new sql files and returns them.
function newSQLFiles()
{
  var newSQL = [];
  for(var i = 0; i < current_list.length; i++)
  {
    if(!master_list.includes(current_list[i]))
    {
      newSQL.push(current_list[i]);
    }
  }
  core.info(newSQL.length + " new sql files detected: " + newSQL.toString());
  core.info("Scan Success!");
  return newSQL;
}

//INPUT: Array of new sql files
//OUTPUT: none
//Tests file format using regex
function fileFormatTest(newSQL)
{
  NEW_SECTION("Initiate Regex File Format Test");

  const regex = RegExp("v" + YEAR + ".[0-1][0-9].[0-3][0-9]_\\d{2}__.*");
  for(var i = 0; i < newSQL.length; i++)
  {
    core.info("Checking " + newSQL[i]);
    if(!regex.test(newSQL[i]))
    {
      TERMINATE_FAIL(newSQL[i] + " fails to match format. Format must be in format vYYYY.MM.DD_xx__Description. Make sure the configurations in your .yml project file are correct too.");
    }
  }
  core.info("Regex File Format Test Successful!");
}

//INPUT: Array of new SQL files
//OUTPUT: None
//Checks if every file has a valid date.
function validDateTest(newSQL)
{
  NEW_SECTION("Initiate Date Validation Test");
  for(var i = 0; i < newSQL.length; i++)
  {
    core.info("Validating date for " + newSQL[i]);
    const split = newSQL[i].substring(0, 11).split(".");
    const month = split[1];
    const day = split[2];

    if(!moment(month + "/" + day + "/" + YEAR, "MM/DD/YYYY", true).isValid())
      TERMINATE_FAIL(newSQL[i] + " has error. " + month + "/" + day + "/" + YEAR + " is not a valid date");
  }
  core.info("Date validation test is successful!");
}

//INPUT: Array of new SQL files
//OUTPUT: none
//Checks that file versions are in correct order relative to master
function versionTest(newSQL)
{
  NEW_SECTION("Checking if new sql files are in order");

  for(var i = 0; i < newSQL.length; i++)
  {
    if(newSQL[i].split("__")[0].localeCompare(master_list[master_list.length - 1].split("__")[0]) <= 0)
    {
      TERMINATE_FAIL(newSQL[i] + " has an outdated date or version. File versions must be in order and newer than previous versions in master.");
    }else
    {
      master_list.push(newSQL[i]);
    }
  }
  core.info("Version checking is complete!".green);
}

//  PROGRAM LOGIC FLOW METHODS
function TERMINATE_FAIL(message)
{
  core.setFailed("FAILED: " + message);
  process.exit(1);
}

function TERMINATE_SUCCESS(message)
{
  core.info("SUCCESS: " + message);
  process.exit(0);
}

function NEW_SECTION(message)
{
  core.info("******************************************")
  core.info(message);
}

//  INITIATION METHODS
function runTests(newSQL)                               //Runs tests in sequence
{
  fileFormatTest(newSQL);                               //Run file format test
  validDateTest(newSQL);                                //Run valid date test
  versionTest(newSQL);                                  //Run version test
  TERMINATE_SUCCESS("Have a good rest of your day!");   //When all tests have passed.
}

function init()                                         //Initiate test
{
  NEW_SECTION("Scanning for new sql files");
  var newSQL = newSQLFiles();                           //Array of new sql files

  if(newSQL.length == 0)
    TERMINATE_SUCCESS("No changes made to sql files");  //No new sql files added. Terminate check as successful

  runTests(newSQL);                                     //If there are sql files added, run the other tests
}
init();                                                 //call initialize method