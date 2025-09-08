require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('data', function(req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${entries.length} people <br/> ${new Date()}`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
       response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findById(id).then(result => {
        if (result) response.json(result)
        else response.status(404).end()
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    entries = entries.filter(entry => entry.id !== id);
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and/or number is missing'
        })
    }

    const entry = new Person({
        name: body.name,
        number: body.number
    })

    entry.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})