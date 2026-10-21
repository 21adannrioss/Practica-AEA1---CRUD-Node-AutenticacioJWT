import jwt from 'jsonwebtoken'
import { CLAU_SECRETA } from '../config.js'
import { UsuariRepository } from '../user-repository.js'

// mira si hi ha token a la cookie i guarda l'usuari a req.session.user
export const carregarSessio = (req, res, next) => {
  req.session = { user: null }
  res.locals.usuari = null

  const token = req.cookies.token_acces
  if(!token) return next()

  try {
    const dades = jwt.verify(token, CLAU_SECRETA)
    // es busca l'usuari al json per tenir totes les seves dades
    const usuari = UsuariRepository.buscarPerId(dades.id)
    if(usuari) {
      req.session.user = usuari
      res.locals.usuari = usuari
    }
  } catch(error) {
    // token fals o caducat
    req.session.user = null
  }
  next()
}

// sense login dona 401
export const necessitaLogin = (req, res, next) => {
  if(!req.session.user) return res.status(401).json({ error: 'No has iniciat sessió' })
  next()
}

// sense login et porta al login
export const necessitaLoginPagina = (req, res, next) => {
  if(!req.session.user) return res.redirect('/login')
  next()
}

// només deixa passar l'admin, si no dona 403
export const necessitaAdmin = (req, res, next) => {
  if(req.session.user.rol !== 'admin') return res.status(403).json({ error: 'No tens permisos per fer això' })
  next()
}