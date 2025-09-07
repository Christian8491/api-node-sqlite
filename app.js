const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
// This PORT was already created
const PORT = 8000;

app.use(express.json());

// Conexión / creación de base de datos
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
  } else {
    console.log("Base de datos conectada.");
  }
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS personas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  edad INTEGER
)`);

// Obtener total de registros
app.get("/personas/total", (req, res) => {
  db.get("SELECT COUNT(*) AS total FROM personas", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Consulta realizada exitosamente", total: row.total });
    }
  });
});

// Agregar persona
app.post("/personas", (req, res) => {
  const { nombre, edad } = req.body;
  if (!nombre || !edad) {
    return res.status(400).json({ message: "Nombre y edad son requeridos." });
  }
  db.run(
    "INSERT INTO personas (nombre, edad) VALUES (?, ?)",
    [nombre, edad],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Persona agregada exitosamente.",
          id: this.lastID,
          nombre,
          edad,
        });
      }
    }
  );
});

// Eliminar persona por ID
app.delete("/personas/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM personas WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Persona no encontrada." });
    } else {
      res.json({ message: "🗑️ Persona eliminada exitosamente.", id });
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
