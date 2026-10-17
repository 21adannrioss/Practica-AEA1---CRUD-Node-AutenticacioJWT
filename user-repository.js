import bcrypt from 'bcrypt'
import { RONDES_SAL } from './config.js'
import { llegirDades, escriureDades, seguentId, crearError } from './fitxers.js'

// treu la contrasenya perquè no s'enviï al client
export const usuariPublic = (usuari) => {
  const { contrasenya, ...resta } = usuari
  return resta
}

// mira si ja hi ha un usuari amb aquest nom o correu (idIgnorar serveix quan modifiquem)
const jaExisteix = (usuaris, camp, valor, idIgnorar) => {
  return usuaris.some((u) => u.id !== idIgnorar && u[camp].toLowerCase() === valor.toLowerCase())
}

export class UsuariRepository {
  static llistar () {
    return llegirDades('users').map(usuariPublic)
  }

  static buscarPerId (id) {
    const usuari = llegirDades('users').find((u) => u.id === Number(id))
    if (!usuari) return null
    return usuariPublic(usuari)
  }

  static buscarPerNom (nom) {
    return llegirDades('users').find((u) => u.usuari.toLowerCase() === String(nom).toLowerCase())
  }

  static async crear ({ usuari, correu, contrasenya, rol = 'usuari' }) {
    Validacio.usuari(usuari)
    Validacio.correu(correu)
    Validacio.contrasenya(contrasenya)
    Validacio.rol(rol)

    const usuaris = llegirDades('users')
    if (jaExisteix(usuaris, 'usuari', usuari)) throw crearError(409, 'Aquest nom d\'usuari ja existeix')
    if (jaExisteix(usuaris, 'correu', correu)) throw crearError(409, 'Aquest correu ja està registrat')

    // encriptem la contrasenya amb bcrypt
    const nouUsuari = {
      id: seguentId(usuaris),
      usuari,
      correu,
      contrasenya: await bcrypt.hash(contrasenya, RONDES_SAL),
      rol
    }
    usuaris.push(nouUsuari)
    escriureDades('users', usuaris)
    return usuariPublic(nouUsuari)
  }

  static async login ({ usuari, contrasenya }) {
    Validacio.usuari(usuari)
    Validacio.contrasenya(contrasenya)

    const trobat = UsuariRepository.buscarPerNom(usuari)
    // el missatge és el mateix si falla l'usuari o la contrasenya
    if (!trobat) throw crearError(401, 'Usuari o contrasenya incorrectes')

    // compare no desencripta, compara la contrasenya amb el hash
    const correcta = await bcrypt.compare(contrasenya, trobat.contrasenya)
    if (!correcta) throw crearError(401, 'Usuari o contrasenya incorrectes')

    return usuariPublic(trobat)
  }

  // esAdmin diu si qui fa la petició és admin (només ell pot canviar el rol)
  static async modificar (id, dades, esAdmin) {
    const usuaris = llegirDades('users')
    const usuari = usuaris.find((u) => u.id === Number(id))
    if (!usuari) throw crearError(404, 'Usuari no trobat')

    if (dades.usuari !== undefined) {
      Validacio.usuari(dades.usuari)
      if (jaExisteix(usuaris, 'usuari', dades.usuari, usuari.id)) throw crearError(409, 'Aquest nom d\'usuari ja existeix')
      usuari.usuari = dades.usuari
    }
    if (dades.correu !== undefined) {
      Validacio.correu(dades.correu)
      if (jaExisteix(usuaris, 'correu', dades.correu, usuari.id)) throw crearError(409, 'Aquest correu ja està registrat')
      usuari.correu = dades.correu
    }
    if (dades.contrasenya !== undefined) {
      Validacio.contrasenya(dades.contrasenya)
      usuari.contrasenya = await bcrypt.hash(dades.contrasenya, RONDES_SAL)
    }
    if (dades.rol !== undefined) {
      if (!esAdmin) throw crearError(403, 'Només un administrador pot canviar el rol')
      Validacio.rol(dades.rol)
      usuari.rol = dades.rol
    }

    escriureDades('users', usuaris)
    return usuariPublic(usuari)
  }

  static esborrar (id) {
    const usuaris = llegirDades('users')
    const posicio = usuaris.findIndex((u) => u.id === Number(id))
    if (posicio === -1) throw crearError(404, 'Usuari no trobat')

    // splice treu 1 element a partir de la posició
    const esborrat = usuaris.splice(posicio, 1)[0]
    escriureDades('users', usuaris)
    return usuariPublic(esborrat)
  }
}

class Validacio {
  static usuari (usuari) {
    if (typeof usuari !== 'string' || usuari.length < 3) throw crearError(400, 'L\'usuari ha de tenir mínim 3 caràcters')
  }

  static correu (correu) {
    if (typeof correu !== 'string' || !/\S+@\S+\.\S+/.test(correu)) throw crearError(400, 'El correu no és vàlid')
  }

  static contrasenya (contrasenya) {
    if (typeof contrasenya !== 'string' || contrasenya.length < 6) throw crearError(400, 'La contrasenya ha de tenir mínim 6 caràcters')
  }

  static rol (rol) {
    if (rol !== 'admin' && rol !== 'usuari') throw crearError(400, 'El rol ha de ser admin o usuari')
  }
}
