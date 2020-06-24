# SQLVersionChecker
## Installation

      - name: Checkout Master Branch
        uses: actions/checkout@v2
        with:
          ref: master

      - name: Store Master Branch Variables
        id: mastersource
        run: |
          cd ./Common/src/main/sql/iris/migration/2020/2020
          echo ::set-output name=MASTERSOURCE::$(ls)

      - name: Checkout Current Branch
        uses: actions/checkout@v2

      - name: Store Current Branch Variables
        id: currentsource
        run: |
          cd ./Common/src/main/sql/iris/migration/2020/2020
          echo ::set-output name=CURRENTSOURCE::$(ls)

      - name: -- THE ACTUAL TEST --
        uses: matteo8p/SQLVersionChecker@v1
        with:
          master_sql: ${{ steps.mastersource.outputs.MASTERSOURCE }}
          current_sql: ${{ steps.currentsource.outputs.CURRENTSOURCE }}
          year: '2020'
