import express from 'express'
import cookieParser from 'cookie-parser'
import { PORT } from './config.js'
import { carregarSessio, necessitaLogin } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import booksRoutes from './routes/books.js'

const app = express()

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use(carregarSessio)

app.get('/', (req, res) => {
  res.render('index', { titol: 'Inici' })
})

app.use('/', authRoutes)

// aquestes rutes només es poden fer servir amb sessió iniciada
app.use('/users', necessitaLogin, usersRoutes)
app.use('/books', necessitaLogin, booksRoutes)

// gestió d'errors
app.use((err, req, res, next) => {
  const status = err.status || 500
  let missatge = err.message
  if(status === 500) {
    console.log(err)
    missatge = 'Error del servidor'
  }
  res.status(status).json({error: missatge})
})

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`)
})