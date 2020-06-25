const core = require('@actions/core');
const github = require('@actions/github');
const moment = require('moment');                     //Date check module

//  INSTANCE VARIABLES
const MASTERSQL = core.getInput('mastersql');
const CURRENTSQL = core.getInput('currentsql');

//  ------------------ INPUT PROCESSING METHODS ------------------

//INPUT: One of the SQL instance variables
//OUTPUT: Map that maps sql files to the folder that contains itself
//Parses through the instance variable and stores information in a map. Only processes folders that are years.
function processSQLInput(INPUT)
{
  let fileMap = new Map();                           //Maps the sql files to the folder that contains it.
  const isYear = RegExp("\\d{4}:");           //Regex to check that folder is a valid year

  let split_section = INPUT.split('./');

  for(var i = 1; i < split_section.length; i++)      //Process each folder that contains the sql files
  {
    var files = split_section[i].split(' ');
    if(isYear.test(files[0]))         //Check that the folder matches a date and the folder isn't empty
    {
      var year = files[0].substring(0, 4);
      var sqlfiles = [];
      if(files.length > 1)
      {
        for(var j = 1; j < files.length; j++)
        {
          sqlfiles.push(files[j]);
        }
      }
      fileMap.set(year, sqlfiles);
    }
  }
  return fileMap;
}

//INPUT: Two Maps of sql files
//OUTPUT: Filtered map of new sql files
//Scans through the master and current maps to search for new sql files
function newSQL(masterSQLMap, currentSQLMap)
{
  let filemap = new Map();
  for(var key of currentSQLMap.keys())          // Iterate through every folder
  {
     var mastersqlfiles = masterSQLMap.get(key);
     var currentsqlfiles = currentSQLMap.get(key);
     var newsqlfiles = [];

     for(var file in currentSQLMap)
     {
       if(!mastersqlfiles.includes(file))
         newsqlfiles.push(file);
     }
     filemap.set(key, newsqlfiles);
  }

  for(var key of filemap)
  {
    core.info(key);
    core.info(filemap.get(key));
  }
}
//  ------------------ END INPUT PROCESSING METHODS ------------------

//  ------------------ TEST METHODS ------------------
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
  NEW_SECTION("Initiate SQLVersionChecker");

  //Parse inputs.
  NEW_SECTION("Generating Map of Master Branch SQL files")
  masterSQLMap = processSQLInput(MASTERSQL);
  NEW_SECTION("Generating Map of Current Branch SQL files");
  currentSQLMap = processSQLInput(CURRENTSQL);

  NEW_SECTION("Scanning for new SQL files");
  newSQLMap = newSQL(masterSQLMap, currentSQLMap);
  // var newSQL = scanSQLFiles();                                       //Array of new sql files
  //
  // if(newSQL.length == 0)
  //   TERMINATE_SUCCESS("No new SQL files were added");  //No new sql files added. Terminate check as successful
  //
  // TERMINATE_SUCCESS("Test Run");
  // runTests(newSQL);                                     //If there are sql files added, run the other tests
}
init();                                                 //call initialize method