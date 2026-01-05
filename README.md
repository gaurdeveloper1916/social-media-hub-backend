** if deploy particular application 
serverless deploy function --function app

** remove a function 
serverless remove    

** deploy a function 
serverless deploy 

** run in localhost
npx serverless offline   

//start application
ngrok http 3000
node queue/call.worker.js
node ./test.add.job.js
nodemon ./server.js