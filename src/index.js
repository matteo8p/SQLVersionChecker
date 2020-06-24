const core = require('@actions/core');
const github = require('@actions/github');
const moment = require("moment");

//  INSTANCE VARIABLESss
const MASTERSQL = core.getInput("master_sql");        //Pulls String of sql files from master
const CURRENTSQL = core.getInput("current_sql");      //Pulls String of sql files from current branch
const YEAR = core.getInput("year");

const master_list = MASTERSQL.split(' ');          //Divide MASTERSQL into Array
const current_list = CURRENTSQL.split(' ');        //Divide CURRENTSQL into Array


// INPUT: NONE
// OUTPUT: Array of new sql files
// Compares current_list to master_list to generate array of new sql filess
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
  core.info("New sql files detected: " + newSQL.toString());
  return newSQL;
}

//INPUT: Array of new Files
//OUTPUT: NA
//File format test. Check if every file in newSQL matches the regex format.
function fileFormatTest(newSQL)
{
  NEW_SECTION("Initiate Regex File Format Test");

  const regex = RegExp("v" + YEAR + ".[0-1][1-9].[0-3][0-9]_\\d{2}__.*");
  for(var i = 0; i < newSQL.length; i++)
  {
    core.info("Checking " + newSQL[i]);
    if(!regex.test(newSQL[i]))
    {
      TERMINATE_FAIL(newSQL[i] + " fails to match format. Format must be in format vYYYY.MM.DD.xx__Description. Make sure the configurations in your .yml project file is correct too.");
    }
  }
  core.info("Regex File Format Test Successful!");
}

//INPUT: Date format in MM/DD/YYYY
//OUTPUT: True/False if day is on a blackout day
function isBlackoutDay(date)
{

}

//INPUT: Array of SQL files
//OUTPUT: None
//Checks if every file has a valid date.
function validDateTest(newSQL)
{

}


//  PROGRAM FLOW METHODS
function TERMINATE_FAIL(message)
{
  core.setFailed("FAILED: " + message);
  process.exit(1);
}

function TERMINATE_SUCCESS(message)
{
  core.info("TESTS SUCCESS: " + message);
  process.exit(0);
}

function NEW_SECTION(message)
{
  core.info("******************************************")
  core.info(message);
}

//  INITIATION METHODSs
function runTests(newSQL)                               //Runs tests in sequence
{
  fileFormatTest(newSQL);                               //Run file format test
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