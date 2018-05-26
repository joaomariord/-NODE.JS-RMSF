# -NODE.JS-RMSF
-----

Server application for RMSF project.

Instructions: 
* To use the server locally in your pc:
    * Install node.js framework (https://nodejs.org/en/) use LTS (8.10.0) due to compatibility.
    * Mode 1: (Fully local, with local db)
        * Run "$ npm init" in the root folder of this project, will configure and download all dependencies  
        * Install mongoDB (https://www.mongodb.com/)
        * Configure mongoDB, get your db URI
        * Go to Configs/config.js in this project and adapt the database_url const to your new mongoDb
        * Run application with "$ npm start"
    * Mode 2: (Local server with online db) -> Easier
        * Run "$ npm init" in the root folder of this project, will configure and download all dependencies  
        * Leave config.js file with the const database_url untouched! It will access our pre deployed online database
        * Run application with "$ npm start"

* You can also use our pre deployed full solution (https://rmsf-server.herokuapp.com/)
