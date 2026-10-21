const $ = (element) => document.querySelector(element)

const formulariLogin = $('#formulari-login')
const formulariRegistre = $('#formulari-registre')
const botoTancar = $('#tancar-sessio')

// escriu un missatge al formulari, verd si va bé i vermell si hi ha error
const mostrarMissatge = (formulari, text, correcte) => {
  const span = formulari.querySelector('.missatge')
  span.innerText = text
  span.style.color = correcte? 'green': 'red'
}

// envia les dades al servidor i si va bé posa la cookie amb el token
if(formulariLogin) {
  formulariLogin.addEventListener('submit', async (e) => {
    e.preventDefault()
    const usuari = $('#login-usuari').value
    const contrasenya = $('#login-contrasenya').value

    const resposta = await fetch('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usuari, contrasenya})
    })
    const dades = await resposta.json()
    if(resposta.ok) {
      mostrarMissatge(formulariLogin, 'Sessió iniciada, entrant...', true)
      setTimeout(() => { window.location.href = '/protected' }, 800)
    } else mostrarMissatge(formulariLogin, dades.error, false)
  })
}

if(formulariRegistre) {
  formulariRegistre.addEventListener('submit', async (e) => {
    e.preventDefault()
    const usuari = $('#registre-usuari').value
    const correu = $('#registre-correu').value
    const contrasenya = $('#registre-contrasenya').value
    const repetir = $('#registre-repetir').value

    if(contrasenya !== repetir) {
      mostrarMissatge(formulariRegistre, 'Les contrasenyes no són iguals', false)
      return
    }

    const resposta = await fetch('/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usuari, correu, contrasenya})
    })
    const dades = await resposta.json()
    if(resposta.ok) {
      mostrarMissatge(formulariRegistre, 'Usuari registrat, entrant...', true)
      setTimeout(() => { window.location.href = '/protected' }, 800)
    } else {
      mostrarMissatge(formulariRegistre, dades.error, false)
    }
  })
}

if(botoTancar) {
  botoTancar.addEventListener('click', async () => {
    await fetch('/logout', {method: 'POST'})
    window.location.href = '/'
  })
}