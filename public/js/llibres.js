const formulari = document.querySelector('#formulari-llibre')
const botoCancelar = document.querySelector('#boto-cancelar')
const span = formulari.querySelector('.missatge')

// torna el formulari a l'estat d'afegir un llibre nou
const netejar = () => {
  formulari.reset()
  document.querySelector('#llibre-id').value = ''
  document.querySelector('#titol-formulari').innerText = 'Afegir un llibre'
  document.querySelector('#boto-desar').innerText = 'Afegir llibre'
  botoCancelar.hidden = true
  span.innerText = ''
}

// si hi ha id fa PUT i si no POST
formulari.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = document.querySelector('#llibre-id').value
  const llibre = {
    titol: document.querySelector('#llibre-titol').value,
    autor: document.querySelector('#llibre-autor').value,
    any: parseInt(document.querySelector('#llibre-any').value)
  }
  const resposta = await fetch(id ? '/books/' + id : '/books', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(llibre)
  })
  const dades = await resposta.json()
  if (resposta.ok) {
    window.location.reload() // es recarrega per veure els canvis a la taula
  } else {
    span.innerText = dades.error
    span.style.color = 'red'
  }
})

// el botó editar posa les dades del llibre al formulari
document.querySelectorAll('.editar-llibre').forEach((boto) => {
  boto.addEventListener('click', () => {
    document.querySelector('#llibre-id').value = boto.dataset.id
    document.querySelector('#llibre-titol').value = boto.dataset.titol
    document.querySelector('#llibre-autor').value = boto.dataset.autor
    document.querySelector('#llibre-any').value = boto.dataset.any
    document.querySelector('#titol-formulari').innerText = 'Modificar el llibre'
    document.querySelector('#boto-desar').innerText = 'Desar canvis'
    botoCancelar.hidden = false
    span.innerText = ''
    formulari.scrollIntoView()
  })
})

botoCancelar.addEventListener('click', netejar)

document.querySelectorAll('.esborrar-llibre').forEach((boto) => {
  boto.addEventListener('click', async () => {
    if (!confirm('Segur que vols esborrar el llibre?')) return
    const resposta = await fetch('/books/' + boto.dataset.id, { method: 'DELETE' })
    if (resposta.ok) window.location.reload()
    else alert('No s\'ha pogut esborrar')
  })
})