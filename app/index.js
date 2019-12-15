/*
    API Nuvem To-Do List
    Author: Thiago P. Martinez <thiago.pereira.ti@gmail.com>
    Created at: 12/12/2019
*/

// Importar bibliotecas
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb')
const util = require('util')

var db = null

// Configurar o Express
const app = express()
app.use(bodyParser.json())
app.use(helmet())

/*
    Listas
*/

// GET - Obter todas as listas
app.get('/listas', (req, res) => {
    db.collection('listas').find({}).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        res.send(docs.map(i => {
            i.id = i._id
            delete i._id
            return i
        })
        )
        res.end()
    })
})

// GET - Obter uma lista
app.get('/listas/:id', (req, res) => {

    const { id } = req.params

    db.collection('listas').find({ _id: MongoClient.ObjectId(id) }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        // Testar se a lista existe
        if (docs.length == 0) {
            res.status(404).send({ "message": "Lista não encontrada." })
            res.end()
            return
        }

        const lista = docs[0]
        lista.id = lista._id
        delete lista._id

        res.send(lista)
        res.end()
    })
})

// POST - Inserir lista
app.post('/listas', async (req, res) => {

    const { nome } = req.body

    // Inserir lista
    db.collection('listas').insertOne({ nome: nome }, (err, result) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        res.send({ "message": result.insertedId })
        res.end()
    })

})

// PUT - Alterar lista
app.put('/listas/:id', async (req, res) => {

    const { id } = req.params
    const { nome } = req.body

    // Testar se a lista existe
    db.collection('listas').find({ _id: MongoClient.ObjectId(id) }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Lista não encontrada." })
            res.send()
            return
        }

        // Alterar lista
        db.collection('listas').updateOne({ _id: MongoClient.ObjectId(id) }, { $set: { nome: nome } }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            res.send({ "message": "OK" })
            res.end()
        })
    })

})

// DELETE - Apagar lista
app.delete('/listas/:id', (req, res) => {

    const { id } = req.params

    // Testar se a lista existe
    db.collection('listas').find({ _id: MongoClient.ObjectId(id) }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Lista não encontrada." })
            res.send()
            return
        }

        // Apagar tarefas relacionadas a lista
        db.collection('tarefas').deleteMany({ idlista: id }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            // Apagar lista
            db.collection('listas').deleteOne({ _id: MongoClient.ObjectID(id) }, (err, result) => {
                if (err) {
                    res.status(500).send('Internal Server Error')
                    res.end()
                    return
                }

                res.send({ "message": "OK" })
                res.end()
            })
        })
    })

})

/*
    Tarefas
*/

// GET - Listar tarefas
app.get('/listas/:idlista/tarefas', (req, res) => {

    const { idlista } = req.params

    db.collection('tarefas').find({ idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        // Listar tarefas
        res.send(docs.map(i => {
            i.id = i._id
            delete i._id
            return i
        })
        )
        res.end()
    })
})

// GET - Obter uma tarefa
app.get('/listas/:idlista/tarefas/:idtarefa', (req, res) => {

    const { idlista, idtarefa } = req.params

    db.collection('tarefas').find({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        // Testar se a lista existe
        if (docs.length == 0) {
            res.status(404).send({ "message": "Tarefa não encontrada." })
            res.end()
            return
        }

        const tarefa = docs[0]
        tarefa.id = tarefa._id
        delete tarefa._id

        res.send(tarefa)
        res.end()
    })
})

// POST - Inserir tarefa
app.post('/listas/:idlista/tarefas', async (req, res) => {

    const { idlista } = req.params
    const { tarefa, created_at, completed } = req.body

    // Inserir tarefa
    db.collection('tarefas').insertOne({ idlista: idlista, tarefa: tarefa, created_at: created_at, completed: completed }, (err, result) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        res.send({ "message": result.insertedId })
        res.end()
    })

})

// PUT - Alterar tarefa
app.put('/listas/:idlista/tarefas/:idtarefa', async (req, res) => {

    const { idlista, idtarefa } = req.params
    const { tarefa, created_at, completed } = req.body

    // Testar se existe a tarefa
    db.collection('tarefas').find({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Tarefa não encontrada." })
            res.send()
            return
        }

        // Alterar tarefa
        db.collection('tarefas').updateOne({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }, { $set: { idlista: idlista, tarefa: tarefa, created_at: created_at, completed: completed } }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            res.send({ "message": "OK" })
            res.end()
        })
    })

})

// PATCH - Alterar descrição da tarefa
app.patch('/listas/:idlista/tarefas/:idtarefa', async (req, res) => {

    const { idlista, idtarefa } = req.params
    const { tarefa } = req.body

    // Testar se existe a tarefa
    db.collection('tarefas').find({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Tarefa não encontrada." })
            res.send()
            return
        }

        // Alterar tarefa
        db.collection('tarefas').updateOne({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }, { $set: { tarefa: tarefa } }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            res.send({ "message": "OK" })
            res.end()
        })
    })

})

// PATCH - Alterar status da tarefa
app.patch('/listas/:idlista/tarefas/:idtarefa/status', async (req, res) => {

    const { idlista, idtarefa } = req.params
    const { completed } = req.body

    // Testar se existe a tarefa
    db.collection('tarefas').find({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Tarefa não encontrada." })
            res.send()
            return
        }

        // Alterar tarefa
        db.collection('tarefas').updateOne({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }, { $set: { completed: completed } }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            res.send({ "message": "OK" })
            res.end()
        })
    })

})

// DELETE - Apagar tarefa
app.delete('/listas/:idlista/tarefas/:idtarefa', (req, res) => {

    const { idlista, idtarefa } = req.params

    // Testar se existe a tarefa
    db.collection('tarefas').find({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }).toArray((err, docs) => {
        if (err) {
            res.status(500).send('Internal Server Error')
            res.end()
            return
        }

        if (docs.length == 0) {
            res.status(404).send({ "message": "Tarefa não encontrada." })
            res.send()
            return
        }

        // Apagar tarefa
        db.collection('tarefas').deleteOne({ _id: MongoClient.ObjectId(idtarefa), idlista: idlista }, (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error')
                res.end()
                return
            }

            res.send({ "message": "OK" })
            res.end()
        })

    })

})

// Iniciar aplicação
async function start() {

    // Ler variáveis de ambiente
    const { MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD } = process.env

    // Conectar ao banco MongoDB
    const connect = util.promisify(MongoClient.connect)
    db = (await connect(`mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:27017`, { useUnifiedTopology: true })).db('nuvem')

    // Ouvir na porta 8080
    app.listen(8080)
}

start()
