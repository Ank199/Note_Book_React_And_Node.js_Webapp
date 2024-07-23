const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')


connectToMongo();

const app =express();
app.use(cors());

app.use(express.json());

const port =5000;

//Available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port,()=>{
    console.log(` iNoteBook Backend app started on port ${port}`);
})

