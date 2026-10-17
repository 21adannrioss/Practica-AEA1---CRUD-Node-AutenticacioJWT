import fs from 'fs'

// llegeix un fitxer json de la carpeta db
export const llegirDades = (nom) => {
  try{
    const dades = fs.readFileSync(`./db/${nom}.json`)
    return JSON.parse(dades)
  }catch (error){
    console.log(error)
    return []
  }
}

// guarda l'array al fitxer json
export const escriureDades = (nom, dades) => {
  try{
    fs.writeFileSync(`./db/${nom}.json`, JSON.stringify(dades, null, 2))
  } catch(error){
    console.log(error)
  }
}

// busca l'id més gran i hi suma 1 (si fem length+1 es repeteixen ids quan s'esborra)
export const seguentId = (llista) => {
  let max = 0
  for (const element of llista){
    if(element.id > max) max = element.id
  }
  return max + 1
}

// crea un error amb el codi http que toca
export const crearError = (status, missatge) => {
  const error = new Error(missatge)
  error.status = status
  return error
}