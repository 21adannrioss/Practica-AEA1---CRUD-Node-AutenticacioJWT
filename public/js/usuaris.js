const formulari = document.querySelector('#formulari-usuari')
const botoCancelar = document.querySelector('#boto-cancelar')
const span = formulari.querySelector('.missatge')

// torna el formulari a l'estat d'afegir un usuari nou
const netejar = () => {
  formulari.reset()
  document.querySelector('#usuari-id').value = ''
  document.querySelector('#titol-formulari').innerText = 'Afegir un usuari'
  document.querySelector('#boto-desar').innerText = 'Afegir usuari'
  document.querySelector('#etiqueta-contrasenya').innerText = 'Contrasenya'
  document.querySelector('#usuari-contrasenya').required = true
  botoCancelar.hidden = true
  span.innerText = ''
}

// si hi ha id fa PUT (modificar) i si no POST (afegir)
formulari.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = document.querySelector('#usuari-id').value
  const usuari = {
    usuari: document.querySelector('#usuari-nom').value,
    correu: document.querySelector('#usuari-correu').value,
    rol: document.querySelector('#usuari-rol').value
  }
  const contrasenya = document.querySelector('#usuari-contrasenya').value
  // en modificar només enviem la contrasenya si l'han escrit
  if (contrasenya) usuari.contrasenya = contrasenya

  const resposta = await fetch(id ? '/users/' + id : '/users', {
    method: id? 'PUT': 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuari)
  })
  const dades = await resposta.json()
  if (resposta.ok) {
    window.location.reload()
  } else {
    span.innerText = dades.error
    span.style.color = 'red'
  }
})

// el botó editar posa les dades de l'usuari al formulari
document.querySelectorAll('.editar-usuari').forEach((boto) => {
  boto.addEventListener('click', () => {
    document.querySelector('#usuari-id').value = boto.dataset.id
    document.querySelector('#usuari-nom').value = boto.dataset.usuari
    document.querySelector('#usuari-correu').value = boto.dataset.correu
    document.querySelector('#usuari-rol').value = boto.dataset.rol
    document.querySelector('#usuari-contrasenya').value = ''
    document.querySelector('#usuari-contrasenya').required = false
    document.querySelector('#etiqueta-contrasenya').innerText = 'Contrasenya nova (si no la vols canviar deixa-ho buit)'
    document.querySelector('#titol-formulari').innerText = 'Modificar l\'usuari'
    document.querySelector('#boto-desar').innerText = 'Desar canvis'
    botoCancelar.hidden = false
    span.innerText = ''
    formulari.scrollIntoView()
  })
})

botoCancelar.addEventListener('click', netejar)

document.querySelectorAll('.esborrar-usuari').forEach((boto) => {
  boto.addEventListener('click', async () => {
    if (!confirm('Segur que vols esborrar l\'usuari?')) return
    const resposta = await fetch('/users/' + boto.dataset.id, { method: 'DELETE' })
    if (resposta.ok) window.location.reload()
    else alert('No s\'ha pogut esborrar')
  })
})