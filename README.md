# JWT + bcrypt + PostgreSQL + EJS

Proyecto sencillo con dos formas de trabajar:

- API JSON en `/api`, pensada para Postman, fetch o clientes externos.
- Web SSR con EJS, pensada para navegador, formularios HTML y cookies.

La base es la misma en los dos casos: usuarios, login con JWT, passwords con bcrypt y libros asociados al usuario logado.

## Instalacion

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

3. Rellenar `.env`:

```env
PORT=3000
ACCESS_TOKEN_SECRET=somerandomaccesstoken
DATABASE_URL=postgresql://user:password@host:5432/database
```

4. Crear tablas en PostgreSQL:

```bash
npm run db:init
```

Tambien se puede ejecutar directamente:

```bash
node create-tables.js
```

O pasar la URL por parametro:

```bash
node create-tables.js "postgresql://user:password@host:5432/database"
```

5. Arrancar la app:

```bash
npm start
```

La app queda en:

```txt
http://localhost:3000
```

## Scripts

```json
"start": "node --watch src/app.js",
"db:init": "node create-tables.js"
```

- `npm start`: arranca Express con recarga cuando cambian archivos.
- `npm run db:init`: carga modelos Sequelize y crea tablas si no existen.

## Dependencias

### Produccion

- `express`: framework HTTP. Define rutas, middlewares, respuestas JSON, render de vistas y archivos estaticos.
- `ejs`: motor de plantillas para SSR. Permite renderizar HTML desde el servidor con `res.render(...)`.
- `dotenv`: carga variables de entorno desde `.env`.
- `sequelize`: ORM para trabajar con PostgreSQL usando modelos JS.
- `pg`: driver de PostgreSQL que usa Sequelize.
- `pg-hstore`: soporte auxiliar usado por Sequelize con PostgreSQL.
- `bcryptjs`: hashea passwords en registro y compara passwords en login.
- `jsonwebtoken`: crea y valida JWT.
- `cookie-parser`: permite leer cookies desde `req.cookies`.

## Estructura

```txt
src/
  app.js
  db.js
  models/
    User.js
    Book.js
    index.js
  controllers/
    authController.js
    bookController.js
    usersController.js
    viewController.js
  routes/
    authRoutes.js
    bookRoutes.js
    usersRoutes.js
    viewRoutes.js
  middlewares/
    authMiddleware.js
  views/
    login.ejs
    register.ejs
    books.ejs
    partials/
      booksHeader.ejs
      booksFooter.ejs
public/
  css/
    style.css
create-tables.js
```

## Base de datos

La conexion esta en:

```txt
src/db.js
```

Usa:

```js
process.env.DATABASE_URL
```

Los modelos principales son:

- `User`: usuarios con `username`, `passwordHash`, `role`.
- `Book`: libros con `title`, `author`, `country`, `language`, `pages`, `year`, `userId`.

Las asociaciones estan en `src/models/index.js`:

```js
User.hasMany(Book, { foreignKey: "userId", as: "books" });
Book.belongsTo(User, { foreignKey: "userId", as: "user" });
```

Esto permite que cada usuario tenga sus propios libros.

## API JSON

Las rutas API se montan en `src/app.js` con prefijo `/api`:

```js
app.use("/api", authRoutes);
app.use("/api", bookRoutes);
app.use("/api", usersRoutes);
```

### Auth API

Rutas:

```txt
POST /api/register
POST /api/login
POST /api/logout
```

Controlador:

```txt
src/controllers/authController.js
```

Registro:

```http
POST /api/register
Content-Type: application/json
```

```json
{
  "username": "data",
  "password": "123456",
  "role": "user"
}
```

Login:

```http
POST /api/login
Content-Type: application/json
```

```json
{
  "username": "data",
  "password": "123456"
}
```

Respuesta:

```json
{
  "accessToken": "..."
}
```

Ese token se usa en rutas protegidas con:

```http
Authorization: Bearer TU_TOKEN
```

### Books API

Rutas:

```txt
GET /api/books
POST /api/books
PUT /api/books/:id
DELETE /api/books/:id
```

Controlador:

```txt
src/controllers/bookController.js
```

Todas estas rutas usan:

```js
authenticateJWT
```

Por eso necesitan header:

```http
Authorization: Bearer TU_TOKEN
```

Crear libro:

```http
POST /api/books
Content-Type: application/json
Authorization: Bearer TU_TOKEN
```

```json
{
  "title": "Mi libro",
  "author": "Yo",
  "country": "Spain",
  "language": "Spanish",
  "pages": 100,
  "year": 2026
}
```

Actualizar libro:

```http
PUT /api/books/1
Content-Type: application/json
Authorization: Bearer TU_TOKEN
```

```json
{
  "title": "Mi libro actualizado",
  "author": "Yo",
  "country": "Spain",
  "language": "Spanish",
  "pages": 120,
  "year": 2026
}
```

Borrar libro:

```http
DELETE /api/books/1
Authorization: Bearer TU_TOKEN
```

Importante: un usuario solo puede ver, actualizar o borrar sus propios libros porque las consultas filtran por:

```js
userId: req.user.id
```

### Admin API

Ruta:

```txt
GET /api/users-with-books
```

Necesita:

```http
Authorization: Bearer TOKEN_DE_ADMIN
```

Usa dos middlewares:

```js
authenticateJWT
authorizeAdmin
```

Primero valida el JWT. Luego comprueba:

```js
req.user.role === "admin"
```

## Web SSR con EJS

Las rutas web no llevan `/api` ni `/web`.

Rutas:

```txt
GET /
GET /login
POST /login
GET /register
POST /register
GET /books
POST /books
POST /books/:id/update
POST /books/:id/delete
POST /logout
```

Controlador:

```txt
src/controllers/viewController.js
```

Vistas:

```txt
src/views/login.ejs
src/views/register.ejs
src/views/books.ejs
```

El flujo SSR es:

```txt
navegador -> ruta web -> viewController -> res.render/res.redirect -> HTML
```

Ejemplo:

```txt
GET /login
```

ejecuta `showLogin` y renderiza:

```js
res.render("login", { pageTitle: "Login", message: "" });
```

Express busca:

```txt
src/views/login.ejs
```

## Formularios HTML, POST, PUT y DELETE

Un formulario HTML normal solo admite:

```html
method="GET"
method="POST"
```

No puede enviar directamente:

```html
method="PUT"
method="DELETE"
```

Por eso en la API si existen rutas reales:

```txt
PUT /api/books/:id
DELETE /api/books/:id
```

Pero en SSR usamos formularios `POST` con rutas claras:

```txt
POST /books/:id/update
POST /books/:id/delete
```

Ejemplo de actualizar en EJS:

```ejs
<form method="POST" action="/books/<%= book.id %>/update">
  <input name="title" value="<%= book.title %>" required />
  <button type="submit">Actualizar</button>
</form>
```

Ejemplo de borrar:

```ejs
<form method="POST" action="/books/<%= book.id %>/delete">
  <button type="submit">X</button>
</form>
```

Tambien se podria hacer con JavaScript usando `fetch` y mandando `PUT` o `DELETE`, o con una libreria como `method-override`. En este proyecto no hace falta porque estamos haciendo SSR sencillo y los formularios POST cubren bien el caso.

## Cookies

En la parte web SSR se usa una cookie para mantener la sesion.

La cookie se crea en login:

```js
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 20 * 60 * 1000,
});
```

Significado:

- `accessToken`: nombre de la cookie.
- `accessToken`: valor guardado dentro, que es el JWT.
- `httpOnly: true`: JavaScript del navegador no puede leer esa cookie con `document.cookie`.
- `sameSite: "lax"`: ayuda a reducir ataques CSRF en navegacion normal.
- `secure: false`: permite HTTP en local. En produccion con HTTPS deberia ser `true`.
- `maxAge: 20 * 60 * 1000`: dura 20 minutos.

Para poder leer cookies en Express se usa:

```js
app.use(cookieParser());
```

Luego en `viewController.js`:

```js
const token = req.cookies?.accessToken;
```

Logout borra la cookie:

```js
res.clearCookie("accessToken");
```

## JWT

JWT se usa para representar la sesion del usuario.

Al hacer login correcto se crea:

```js
const accessToken = jwt.sign(
  { id: user.id, username: user.username, role: user.role },
  accessTokenSecret,
  { expiresIn: "20m" }
);
```

Dentro del token se guarda:

- `id`: id del usuario.
- `username`: nombre de usuario.
- `role`: `user` o `admin`.

El servidor luego valida el token con:

```js
jwt.verify(token, accessTokenSecret)
```

En API:

- El cliente manda el token en `Authorization: Bearer ...`.
- `authMiddleware.js` valida el token y guarda el usuario en `req.user`.

En SSR:

- El navegador guarda el token en cookie `accessToken`.
- `viewController.js` lee la cookie y valida el JWT con `getSessionUser(req)`.

## bcrypt

bcrypt se usa para no guardar passwords en texto plano.

En registro:

```js
passwordHash: await bcrypt.hash(password, 10)
```

Esto guarda un hash, no la password original.

En login:

```js
await bcrypt.compare(password, user.passwordHash)
```

Esto compara la password escrita por el usuario con el hash guardado.

El `10` es el coste. A mayor coste, mas lento y mas resistente. Para este proyecto `10` esta bien.

## Middleware de autenticacion

Archivo:

```txt
src/middlewares/authMiddleware.js
```

Se usa en la API:

```js
router.get("/books", authenticateJWT, getBooks);
```

Lee el token desde:

```js
req.headers.authorization?.split(" ")[1]
```

Es decir, espera:

```http
Authorization: Bearer TU_TOKEN
```

No lee cookies porque las cookies pertenecen al flujo SSR de `viewController.js`.

## EJS

EJS permite meter datos y logica sencilla dentro del HTML.

Etiquetas principales:

```ejs
<%= variable %>
```

Imprime una variable escapada.

```ejs
<% if (condicion) { %>
  HTML
<% } %>
```

Ejecuta JavaScript sin imprimir directamente.

```ejs
<%- include("partials/booksHeader", { pageTitle }) %>
```

Imprime HTML sin escapar. Se usa para includes/partials.

```ejs
<%# comentario %>
```

Comentario EJS. No aparece en el HTML final.

Regla practica: la vista debe tener logica sencilla (`if`, `forEach`, mostrar datos). La logica importante debe estar en controladores.

## Express importante

En `src/app.js`:

```js
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
```

Esto dice a Express que use EJS y que busque las vistas en:

```txt
src/views
```

Tambien:

```js
app.use(express.json());
```

Lee bodies JSON para la API.

```js
app.use(express.urlencoded({ extended: false }));
```

Lee formularios HTML enviados como `application/x-www-form-urlencoded`.

Sin `express.urlencoded`, `req.body` estaria vacio en los formularios SSR.

```js
app.use("/css", express.static(path.join(process.cwd(), "public", "css")));
```

Sirve archivos CSS publicos desde:

```txt
/css/style.css
```

## Pruebas rapidas con Postman

Base URL:

```txt
http://localhost:3000
```

1. Registrar:

```txt
POST /api/register
```

2. Login:

```txt
POST /api/login
```

3. Copiar `accessToken`.

4. Crear libro:

```txt
POST /api/books
Authorization: Bearer TU_TOKEN
```

5. Ver libros:

```txt
GET /api/books
Authorization: Bearer TU_TOKEN
```

6. Actualizar libro:

```txt
PUT /api/books/1
Authorization: Bearer TU_TOKEN
```

7. Borrar libro:

```txt
DELETE /api/books/1
Authorization: Bearer TU_TOKEN
```

## Pruebas rapidas en navegador

1. Entrar en:

```txt
http://localhost:3000/register
```

2. Crear usuario.

3. Hacer login en:

```txt
http://localhost:3000/login
```

4. Ir a:

```txt
http://localhost:3000/books
```

5. Crear, actualizar o borrar libros desde los formularios.

En esta parte no hace falta copiar tokens: el navegador manda automaticamente la cookie `accessToken`.

## Cheatsheet EJS

### Pintar una variable

```ejs
<%= pageTitle %>
```

Imprime una variable escapada.

### Ejecutar logica JS

```ejs
<% if (loggedIn) { %>
  <p>Estas logado</p>
<% } else { %>
  <p>No estas logado</p>
<% } %>
```

`<% %>` ejecuta JavaScript, pero no imprime nada directamente.

### Recorrer arrays

```ejs
<% books.forEach((book) => { %>
  <p><%= book.title %></p>
<% }); %>
```

### Incluir partials

```ejs
<%- include("partials/booksHeader", { pageTitle }) %>
```

`<%- %>` imprime HTML sin escapar. Se usa para includes.

### Comentarios EJS

```ejs
<%# Esto no aparece en el HTML final %>
```

### Formulario SSR

```ejs
<form method="POST" action="/books">
  <input name="title" required />
  <button type="submit">Crear</button>
</form>
```

El servidor recibe los datos en:

```js
req.body.title
```

## Cheatsheet Sequelize

### Conexion

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});
```

En este proyecto esta en:

```txt
src/db.js
```

### Crear un modelo / tabla

```js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Book = sequelize.define("Book", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
```

Esto define una tabla/modelo.

### Crear tablas

```js
await sequelize.sync();
```

En este proyecto lo ejecuta:

```txt
create-tables.js
```

### Relacion uno a muchos

Un usuario tiene muchos libros:

```js
User.hasMany(Book, {
  foreignKey: "userId",
  as: "books",
});
```

Un libro pertenece a un usuario:

```js
Book.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
```

### Relacion uno a uno

Ejemplo generico: un usuario tiene un perfil y un perfil pertenece a un usuario.

```js
User.hasOne(Profile, {
  foreignKey: "userId",
  as: "profile",
});
```

```js
Profile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
```

Consulta con relacion:

```js
const user = await User.findOne({
  where: { id: 1 },
  include: {
    model: Profile,
    as: "profile",
  },
});
```

### Crear registro

```js
await Book.create({
  title: "Mi libro",
  author: "Yo",
  userId: req.user.id,
});
```

### Buscar muchos

```js
const books = await Book.findAll({
  where: { userId: req.user.id },
});
```

### Buscar uno

```js
const book = await Book.findOne({
  where: { id: req.params.id, userId: req.user.id },
});
```

### Actualizar

```js
await Book.update(
  { title: "Nuevo titulo" },
  { where: { id: req.params.id, userId: req.user.id } }
);
```

Tambien se puede actualizar una instancia:

```js
const book = await Book.findOne({ where: { id: 1 } });
await book.update({ title: "Nuevo titulo" });
```

### Borrar

```js
await Book.destroy({
  where: { id: req.params.id, userId: req.user.id },
});
```

### Consultar con relacion

```js
const users = await User.findAll({
  include: {
    model: Book,
    as: "books",
  },
});
```

Esto devuelve usuarios con sus libros dentro de `books`.
