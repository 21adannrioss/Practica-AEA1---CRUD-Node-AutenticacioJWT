import { Router } from 'express'
import { UsuariRepository } from '../user-repository.js'
import { crearError } from '../fitxers.js'
import { necessitaAdmin } from '../middleware/auth.js'

const router = Router()

const esAdmin = (req) => req.session.user.rol === 'admin'
const esElMateix = (req) => req.session.user.id === Number(req.params.id)

// l'admin veu tot i la resta només id, usuari i rol
router.get('/', (req, res) => {
  const usuaris = UsuariRepository.llistar()
  if (esAdmin(req)) return res.json(usuaris)
  const resum = []
  for (const u of usuaris) {
    resum.push({id: u.id, usuari: u.usuari, rol: u.rol})
  }
  res.json(resum)
})

// veure un usuari, només el mateix usuari o l'admin
router.get('/:id', (req, res) => {
  if (!esAdmin(req) && !esElMateix(req)) {
    throw crearError(403, 'No pots veure les dades d\'un altre usuari')
  }
  const usuari = UsuariRepository.buscarPerId(req.params.id)
  if (!usuari) throw crearError(404, 'Usuari no trobat')
  res.json(usuari)
})

// crear usuari, només admin
router.post('/', necessitaAdmin, async (req, res) => {
  const usuari = await UsuariRepository.crear(req.body)
  res.status(201).json(usuari)
})

// modificar usuari, només el mateix usuari o l'admin
router.put('/:id', async (req, res) => {
  if (!esAdmin(req) && !esElMateix(req)) {
    throw crearError(403, 'No pots modificar un altre usuari')
  }
  const usuari = await UsuariRepository.modificar(req.params.id, req.body, esAdmin(req))
  res.json({ missatge: 'Usuari modificat', usuari })
})

// esborrar usuari, només admin
router.delete('/:id', necessitaAdmin, (req, res) => {
  const usuari = UsuariRepository.esborrar(req.params.id)
  res.json({ missatge: 'Usuari esborrat', usuari })
})

export default router