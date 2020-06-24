# SQLVersionChecker 

## What it does
- Checks to see if new .sql files are added. (proceed if new files added) 
- File formatting test ensuring file names meet this format: vYYYY.MM.DD_Description.sql 
- Checks to ensure that MM/DD/YYYY is a valid date. 
- Checks to see that date and version numbers are newer than the previous .sql files in master. (Version enforcer) 

If any of these steps fail, the test will fail. 

## Installation: 

Create a GitHub Action. Set the .yml file to have the following properties below. Make sure that configuration points to the correct sql directory, and the year is the desired sql deployment year. 

    name: SQL Checker

    on:
      pull_request:
        branches:
          - master
      push:
        branches:
          - master

    jobs:
      SQLChecker:
        runs-on: ubuntu-latest
        name: Run SQLVersionChecker

        steps:

          - name: Checkout Master Branch
            uses: actions/checkout@v2
            with:
              ref: master

          - name: Store Master Branch Variables
            id: mastersource
            run: |
              cd ./Iris/Common/src/main/sql/iris/migration/2020
              echo ::set-output name=MASTERSOURCE::$(ls)
          - name: Checkout Current Branch
            uses: actions/checkout@v2

          - name: Store Current Branch Variables
            id: currentsource
            run: |
              cd ./Iris/Common/src/main/sql/iris/migration/2020
              echo ::set-output name=CURRENTSOURCE::$(ls)
          - name: -- THE ACTUAL TEST --
            uses: matteo8p/SQLVersionChecker@v1
            with:
              master_sql: ${{ steps.mastersource.outputs.MASTERSOURCE }}
              current_sql: ${{ steps.currentsource.outputs.CURRENTSOURCE }}
              year: '2020' 

