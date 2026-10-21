const formulari = document.querySelector('#formulari-perfil')
const span = formulari.querySelector('.missatge')

formulari.addEventListener('submit', async (e) => {
  e.preventDefault()
  const dades = {correu: document.querySelector('#perfil-correu').value}
  const contrasenya = document.querySelector('#perfil-contrasenya').value
  if(contrasenya) dades.contrasenya = contrasenya // només s'envia la contrasenya si l'han escrit

  const resposta = await fetch('/users/' + formulari.dataset.id, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(dades)
  })
  const resultat = await resposta.json()
  if(resposta.ok) {
    span.innerText = 'Dades desades'
    span.style.color = 'green'
    setTimeout(() => window.location.reload(), 800)
  } else{
    span.innerText = resultat.error
    span.style.color = 'red'
  }
})