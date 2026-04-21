// Book falso: asi no usamos la base de datos real en los tests.
const mockBook = {
  findAll: jest.fn(),
  create: jest.fn(),
};

// Cuando el controlador pida "../models", le damos nuestro Book falso.
jest.mock("../src/models", () => ({
  Book: mockBook,
}));

const { getBooks, addBook } = require("../src/controllers/bookController");

// Respuesta falsa de Express.
// Permite probar res.status(...).json(...).
const fakeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

// Limpia las llamadas anteriores antes de cada test.
beforeEach(() => {
  jest.clearAllMocks();
});

//obtener libros 
test("getBooks devuelve los libros del usuario", async () => {
  const books = [
    {
      id: 1,
      title: "Libro",
      author: "Ana",
      country: "Spain",
      language: "Spanish",
      pages: 100,
      year: 2026,
    },
  ];
  // cuando te llamen, devuelve una promesa resuelta con este valor
  mockBook.findAll.mockResolvedValue(books);

  // req.user lo pondria el middleware JWT en una peticion real.
  const req = { user: { id: 7 } };
  const res = fakeRes();

  await getBooks(req, res);

// Espero que mockBook.findAll haya sido llamado con un objeto
// que al menos tenga where: { userId: 7 }
  expect(mockBook.findAll).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { userId: 7 },
    })
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(books);
});
//crear libro ERROR 400 
test("addBook devuelve 400 si no hay title", async () => {
  const req = {
    body: {},
    user: { id: 7 },
  };
  const res = fakeRes();

  await addBook(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    message: "Title is required",
  });
});
//crear libro 
test("addBook crea un libro", async () => {
  const book = { id: 1, title: "Libro" };
  mockBook.create.mockResolvedValue(book);

  const req = {
    body: {
      title: "Libro",
      author: "Ana",
      country: "Spain",
      language: "Spanish",
      pages: 100,
      year: 2026,
    },
    user: { id: 7 },
  };
  const res = fakeRes();

  await addBook(req, res);

  expect(mockBook.create).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Libro",
      author: "Ana",
      country: "Spain",
      language: "Spanish",
      pages: 100,
      year: 2026,
      userId: 7,
    })
  );
  expect(res.status).toHaveBeenCalledWith(201);
});
