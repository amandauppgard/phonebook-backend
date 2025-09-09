require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('data', function(req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/info', (request, response, next) => {
    Person.find({}).then(result => {
        response.send(`Phonebook has info for ${result.length} people <br/> ${new Date()}`)
    })
    .catch(e => next(e))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
       response.json(result)
    })
    .catch(e => next(e))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findById(id).then(result => {
        if (result) response.json(result)
        else response.status(404).end()
    })
    .catch(e => next(e))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
    .then(result => {
        response.status(204).end()
    })
    .catch(e => next(e))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and/or number is missing'
        })
        .catch(e => next(e))
    }

    const entry = new Person({
        name: body.name,
        number: body.number
    })

    entry.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(e => next(e))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body
    const id = request.params.id
    Person.findById(id)
    .then(person => {
        if (!person) {
            return response.status(404).end()
        }

        person.name = name
        person.number = number

        return person.save().then((updatedPerson) => {
            response.json(updatedPerson)
        })
    })
    .catch(e => next(e))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})