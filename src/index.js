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
          if(files[j].valueOf() != ''.valueOf())
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
  let newSQLMap = new Map();

  for(var key of masterSQLMap.keys())             //Checks to see if a file directory was deleted. Directories shouldn't be deleted.
  {
    if(!currentSQLMap.has(key))
      TERMINATE_FAIL("Missing folder directory: " + key);
  }

  for(var key of currentSQLMap.keys())          // Iterate through every folder
  {
     if(!masterSQLMap.has(key))                 // If new folder directory is created
     {
       newSQLMap.set(key, currentSQLMap.get(key));
     }else                                      // Regular check
     {
       var currentsqlfilesArray = currentSQLMap.get(key);
       var mastersqlfilesArray = masterSQLMap.get(key);
       var newsqlfilesArray = [];

       for(var i = 0; i < currentsqlfilesArray.length; i++)
       {
         if(!mastersqlfilesArray.includes(currentsqlfilesArray[i]))
           newsqlfilesArray.push(currentsqlfilesArray[i]);
       }
       newSQLMap.set(key, newsqlfilesArray);
     }
  }
  console.log("New SQL Files Detected: ");
  console.log(newSQLMap);
  return newSQLMap;
}
//  ------------------ END INPUT PROCESSING METHODS ------------------

//  ------------------ TEST METHODS ------------------

//INPUT: Map of new SQL files
//OUTPUT: none
//Tests whether new sql files were added or not.
function newSQLFileExistsTest(newSQLMap)
{
  var newSQLFileExists = false;                         //Assume no files exist at beginning
  var newFilesCount = 0;
  for(var key of newSQLMap.keys())
  {
    var files = newSQLMap.get(key);
    if(files.length > 0)                                //This means that new files do exist
    {
      newSQLFileExists = true;                          //Set fileexists to true
      newFilesCount = newFilesCount + files.length;     //Increment the number of new files discovered
    }
  }
  if(!newSQLFileExists)
    TERMINATE_SUCCESS("No new sql files detected");
  core.info(newFilesCount + " new sql files detected");
}

//INPUT: Array of new sql files
//OUTPUT: none
//Tests file format using regex
function fileFormatTest(newSQLMap)
{
  for(var key of newSQLMap.keys())                  //Iterate through every directory
  {
    var regex = RegExp("v" + key + ".\\d{2}.\\d{2}_\\d{2}__.*");    //Generate unique regex based on the directory
    var files = newSQLMap.get(key);           //Array of files

    for(var i = 0; i < files.length; i++)         //Test every file for regex formatting
    {
      core.info("Checking " + files[i]);
      if(!regex.test(files[i]))
        TERMINATE_FAIL(files[i] + " fails to match format. Format must be in format vYYYY.MM.DD_xx__Description. Also, The file's year must match the folder's year.");
    }
  }
  core.info("Regex File Format Test Successful!");
}

//INPUT: Array of new SQL files
//OUTPUT: None
//Checks if every file has a valid date.
function validDateTest(newSQLMap)
{
  for(var key of newSQLMap.keys())                        //Iterate through every directory
  {
    var files = newSQLMap.get(key);                       //Array of file names
    for(var i = 0; i < files.length; i++)                 //Iterate through file names
    {
      core.info("Validating date for " + files[i]);
      var split = files[i].substring(0, 11).split(".");       //Extract date
      var month = split[1];
      var day = split[2];

      if(!moment(month + "/" + day + "/" + key, "MM/DD/YYYY", true).isValid())              //Check date validity with moment.
        TERMINATE_FAIL(files[i] + " has error. " + month + "/" + day + "/" + key + " is not a valid date");
    }
  }
  core.info("Date validation test is successful!");
}

//INPUT: Maps of sql files from master branch and the new branch
//OUTPUT: none
//Checks that file versions are in correct order relative to master
function versionTest(masterSQLMap, newSQLMap)
{
  for(var key of newSQLMap.keys())                            //iterate through every directory
  {
    console.log("Year " + key)
    if(!masterSQLMap.has(key))                                //If there is a newly created directory, create an image in master map
      masterSQLMap.set(key, ['']);

    var newfiles = newSQLMap.get(key);                         //New files
    var masterfiles = masterSQLMap.get(key);                   //Master files
    for(var i = 0; i < newfiles.length; i++)                  //iterate throught sql file in the directory
    {
      console.log("Checking " + newfiles[i]);
      if(newfiles[i].split("__")[0].localeCompare(masterfiles[masterfiles.length - 1].split("__")[0]) <= 0)
      {
        TERMINATE_FAIL(newfiles[i] + " has an outdated date or version. File versions must be in order and newer than previous versions in master.");
      }else
      {
        masterfiles.push(newfiles[i]);
      }
    }
  }
  core.info("Version checking is complete!");
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

function init()                                         //Initiate test
{
  NEW_SECTION("Initiate SQLVersionChecker");

  //Parse inputs
  //Generate a map of sql files in Master
  NEW_SECTION("Generating Map of Master Branch SQL files")
  var masterSQLMap = processSQLInput(MASTERSQL);
  //Generate a map of sql files in current Branch
  NEW_SECTION("Generating Map of Current Branch SQL files");
  var currentSQLMap = processSQLInput(CURRENTSQL);
  //Compare the two maps to find new files added
  NEW_SECTION("Scanning for new SQL files");
  var newSQLMap = newSQL(masterSQLMap, currentSQLMap);

  //Tests

  //New SQL files Test
  NEW_SECTION("Running New SQL Files Test");
  newSQLFileExistsTest(newSQLMap);
  //File Format Regex Test
  NEW_SECTION("Initiate Regex File Format Test");
  fileFormatTest(newSQLMap);
  //Valid Date Test
  NEW_SECTION("Initiate Date Validation Test");
  validDateTest(newSQLMap);
  //Version Testing
  NEW_SECTION("Checking if new sql files are in order");
  versionTest(masterSQLMap, newSQLMap);

  TERMINATE_SUCCESS("All tests passed. Have a nice day!");
}
init();                                                 //call initialize method