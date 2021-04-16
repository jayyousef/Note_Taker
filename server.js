//dependencies
const express = require('express');
const http = require('http')
const fs = require('fs')
const path = require('path')
const db = require('./db/db.json')
const {v4: uuidv4} = require('uuid');
const {finished} = require('stream');

//sets up the express app
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static('public'));

// res.send("the index.html homepage")
app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// When user clicks notes on the main html the back end will take them to the notes page
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    console.log(data)
    let parsedData = JSON.parse(data);
    console.log(parsedData)
    return res.json(parsedData);
  })
})


app.post('/api/notes', (req, res) => {
  // req.body hosts is equal to the JSON post sent from the user
  // This works because of our body parsing middleware
  const newNote = req.body;

  // We then add the json the user sent to the character array
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    console.log(data)
    //converting our string to a JSON to be handled by the front end JS
    let parsedData = JSON.parse(data);
    //create a unique ID to handle note deletion
    const newId = uuidv4()
    newNote.id = newId;
    //pushing our new data to our band end database array as a new object
    parsedData.push(newNote);
    //converting the JSON back to a string to be writting to the DB file

    //writing the new file including the updated array of objects
    fs.writeFile('db/db.json', JSON.stringify(parsedData), (err) => {
      if (err)
        console.log(err);
      else {
        return res.json(newNote);
      }
    })
  })
})

//this delete request will find the note sent to the back end and delete it IF it exists
app.delete('/api/notes/:id', (req, res) => {
  // const id = req.params.id
  const { params: {id} } = req;

for (const [i,element] of db.entries()) {
  if (element.id===id) {
    db.splice(i,1);
    fs.writeFile('db/db.json', JSON.stringify(db), (err) => {
      if (err)
        console.log(err);
      else {
        return res.json(db)
      }
    })
  }
}
})


// Starts the server to begin listening
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));