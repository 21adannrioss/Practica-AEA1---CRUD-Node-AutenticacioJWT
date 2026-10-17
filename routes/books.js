import { Router } from 'express'
import { llegirDades, escriureDades, seguentId, crearError } from '../fitxers.js'

const router = Router()

// només el propietari o l'admin pot modificar/esborrar
const potEditar = (req, llibre) => {
  return req.session.user.rol === 'admin' || llibre.propietariId === req.session.user.id
}

const validarLlibre = ({ titol, autor, any }) => {
  if(typeof titol !== 'string' || titol.trim() === '') throw crearError(400, 'El títol és obligatori')
  if(typeof autor !== 'string' || autor.trim() === '') throw crearError(400, 'L\'autor és obligatori')
  if(!Number.isInteger(any) || any < 1000 || any > new Date().getFullYear()) {
    throw crearError(400, 'L\'any ha de ser un número entre 1000 i l\'any actual')
  }
}

// no deixa tenir dos llibres amb el mateix títol i autor
const comprovarRepetit = (llibres, nou, idIgnorar) => {
  const repetit = llibres.find((l) => {
    return l.id !== idIgnorar && l.titol.toLowerCase() === nou.titol.toLowerCase() && l.autor.toLowerCase() === nou.autor.toLowerCase()
  })
  if(repetit) throw crearError(409, `Ja existeix aquest llibre (id ${repetit.id})`)
}

router.get('/', (req, res) => {
  res.json(llegirDades('books'))
})

router.get('/:id', (req, res) => {
  const llibres = llegirDades('books')
  const llibre = llibres.find((l) => l.id === Number(req.params.id))
  if (!llibre) throw crearError(404, 'Llibre no trobat')
  res.json(llibre)
})

router.post('/', (req, res) => {
  const dades = req.body ?? {}
  validarLlibre(dades)
  const llibres = llegirDades('books')
  comprovarRepetit(llibres, dades)

  const nouLlibre = {
    id: seguentId(llibres),
    titol: dades.titol,
    autor: dades.autor,
    any: dades.any,
    propietariId: req.session.user.id
  }
  llibres.push(nouLlibre)
  escriureDades('books', llibres)
  res.status(201).json(nouLlibre)
})

router.put('/:id', (req, res) => {
  const dades = req.body ?? {}
  const llibres = llegirDades('books')
  const posicio = llibres.findIndex((l) => l.id === Number(req.params.id))
  if (posicio === -1) throw crearError(404, 'Llibre no trobat')
  if (!potEditar(req, llibres[posicio])) {
    throw crearError(403, 'Només el propietari o un admin pot modificar aquest llibre')
  }

  validarLlibre(dades)
  comprovarRepetit(llibres, dades, llibres[posicio].id)
  llibres[posicio] = { ...llibres[posicio], titol: dades.titol, autor: dades.autor, any: dades.any }
  escriureDades('books', llibres)
  res.json({ missatge: 'Llibre modificat', llibre: llibres[posicio] })
})

router.delete('/:id', (req, res) => {
  const llibres = llegirDades('books')
  const posicio = llibres.findIndex((l) => l.id === Number(req.params.id))
  if (posicio === -1) throw crearError(404, 'Llibre no trobat')
  if (!potEditar(req, llibres[posicio])) {
    throw crearError(403, 'Només el propietari o un admin pot esborrar aquest llibre')
  }

  // splice treu 1 element a partir de la posició
  const esborrat = llibres.splice(posicio, 1)[0]
  escriureDades('books', llibres)
  res.json({ missatge: 'Llibre esborrat', llibre: esborrat })
})

export default router