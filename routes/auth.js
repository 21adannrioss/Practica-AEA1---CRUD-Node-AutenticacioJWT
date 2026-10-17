import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { CLAU_SECRETA, TEMPS_TOKEN, TEMPS_COOKIE, PRODUCCIO } from '../config.js'
import { UsuariRepository } from '../user-repository.js'
import { llegirDades } from '../fitxers.js'
import { necessitaLoginPagina } from '../middleware/auth.js'

const router = Router()

// crea el token i el guarda a la cookie
const enviarToken = (res, usuari) => {
  const token = jwt.sign(
    { id: usuari.id, usuari: usuari.usuari, rol: usuari.rol },
    CLAU_SECRETA,
    { expiresIn: TEMPS_TOKEN }
  )
  res.cookie('token_acces', token, {
    httpOnly: true, // des de javascript no es pot llegir
    secure: PRODUCCIO, // només https quan és producció
    sameSite: 'strict',
    maxAge: TEMPS_COOKIE
  })
}

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/protected')
  res.render('login', { titol: 'Accés' })
})

router.post('/register', async (req, res) => {
  const { usuari, correu, contrasenya } = req.body ?? {}
  // el rol sempre és usuari, així ningú es pot fer admin
  const nouUsuari = await UsuariRepository.crear({ usuari, correu, contrasenya, rol: 'usuari' })
  enviarToken(res, nouUsuari)
  res.status(201).json({ missatge: 'Usuari registrat', usuari: nouUsuari })
})

router.post('/login', async (req, res) => {
  const { usuari, contrasenya } = req.body ?? {}
  const usuariTrobat = await UsuariRepository.login({ usuari, contrasenya })
  enviarToken(res, usuariTrobat)
  res.json({ missatge: 'Sessió iniciada', usuari: usuariTrobat })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token_acces')
  res.json({ missatge: 'Sessió tancada' })
})

router.get('/protected', necessitaLoginPagina, (req, res) => {
  const usuaris = UsuariRepository.llistar()
  // afegim el nom del propietari a cada llibre per mostrar-lo a la taula
  const llibres = llegirDades('books').map((l) => {
    const propietari = usuaris.find((u) => u.id === l.propietariId)
    return { ...l, propietari: propietari ? propietari.usuari : '-' }
  })
  res.render('protected', { titol: 'Zona privada', llibres })
})

// pàgina per gestionar usuaris, només per a l'admin
router.get('/admin', necessitaLoginPagina, (req, res) => {
  if (req.session.user.rol !== 'admin') return res.redirect('/protected')
  res.render('admin', { titol: 'Usuaris', usuaris: UsuariRepository.llistar() })
})

router.get('/profile', necessitaLoginPagina, (req, res) => {
  res.render('profile', { titol: 'El meu perfil' })
})

export default router