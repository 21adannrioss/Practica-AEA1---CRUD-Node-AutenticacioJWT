# Biblioteca - autenticació amb JWT i CRUD

## Com executar-ho

```
npm install
npm run dev (http://localhost:3000)
```

Usuaris d'exemple (a `db/users.json`):

| Usuari | Contrasenya | Rol    |
|--------|-------------|--------|
| admin  | Admin1234   | admin  |
| anna   | Anna1234    | usuari |
| joan   | Joan1234    | usuari |

## Rutes

### Pàgines

| Ruta           | Qui hi pot entrar | Què fa |
|----------------|-------------------|--------|
| GET /          | tothom            | pàgina d'inici |
| GET /login     | tothom            | formularis de login i registre |
| GET /protected | només amb sessió  | zona privada: llista de llibres amb formulari per afegir, editar i esborrar |
| GET /admin     | només admin       | llista d'usuaris amb formulari per afegir, editar i esborrar. Un usuari normal és enviat a `/protected` |
| GET /profile   | només amb sessió  | dades de l'usuari i formulari per canviar el correu i la contrasenya |

Si no s'ha iniciat sessió, aquestes pàgines porten al `/login`.

### Autenticació

| Mètode | Ruta      | Body | Resposta |
|--------|-----------|------|----------|
| POST   | /register | usuari, correu, contrasenya | 201, o 400 / 409 si hi ha error |
| POST   | /login    | usuari, contrasenya | 200 i la cookie amb el token, o 401 |
| POST   | /logout   | - | 200 |

### Books (cal sessió)

| Mètode | Ruta       | Què fa | Qui pot |
|--------|------------|--------|---------|
| GET    | /books     | llista de llibres | tothom amb sessió |
| GET    | /books/:id | un llibre | tothom amb sessió |
| POST   | /books     | crea un llibre (titol, autor, any) | tothom amb sessió |
| PUT    | /books/:id | modifica un llibre (titol, autor, any) | propietari o admin |
| DELETE | /books/:id | esborra un llibre | propietari o admin |

### Users (cal sessió)

| Mètode | Ruta       | Què fa | Qui pot |
|--------|------------|--------|---------|
| GET    | /users     | llista d'usuaris (l'admin veu tots els camps, els altres només id, usuari i rol) | tothom amb sessió |
| GET    | /users/:id | un usuari | ell mateix o admin |
| POST   | /users     | crea un usuari (es pot posar el rol) | admin |
| PUT    | /users/:id | modifica usuari, correu, contrasenya o rol | ell mateix o admin (el rol només l'admin) |
| DELETE | /users/:id | esborra un usuari | admin |

## Què es pot fer des de la web

Cada operació de l'API té el seu botó o formulari a la web (amb `fetch` des de `public/js`):

| Operació | On es fa a la web |
|----------|-------------------|
| Veure llibres (GET /books) | `/protected`, taula de llibres |
| Afegir un llibre (POST /books) | `/protected`, formulari «Afegir un llibre» |
| Modificar un llibre (PUT /books/:id) | `/protected`, botó Editar (omple el formulari) i Desar canvis |
| Esborrar un llibre (DELETE /books/:id) | `/protected`, botó Esborrar |
| Veure usuaris (GET /users) | `/admin`, taula d'usuaris |
| Afegir un usuari (POST /users) | `/admin`, formulari «Afegir un usuari» |
| Modificar un usuari (PUT /users/:id) | `/admin`, botó Editar (omple el formulari) i Desar canvis |
| Esborrar un usuari (DELETE /users/:id) | `/admin`, botó Esborrar |
| Canviar les meves dades (PUT /users/:id) | `/profile`, formulari |