const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const app = express();
const port = 3000;

axios
  .get("https://pokeapi.co/api/v2/pokemon/?limit=10")
  .then((response) => {
    data = response.data.results;
    // Connect to DB
    const db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to the in-memory SQlite database.");
      // Create table
      db.run("CREATE TABLE pokemon (name TEXT, url TEXT)", (err) => {
        if (err) {
          return console.error("Error creating table:", err.message);
        }
        console.log('Table "pokemon" created.');
        // Instert Data
        insertPokemon(db).then(
          //Get data
          db.all("SELECT * FROM pokemon", (err, rows) => {
            if (err) {
              console.error(err.message);
            }
            console.log(rows);
            console.log(typeof rows);
            app.get("/", (req, res) => {
              res.send("Hello World!");
            });

            app.listen(port, () => {
              console.log(`Example app listening on port ${port}`);
            });

            app.get("/api/pokemon", (req, res) => {
              res.send(rows);
            });
          })
        );
      });
    });
    //Close Connection
    db.close((err) => {
      if (err) {
        return console.error("Error closing database:", err.message);
      }
      console.log("Database connection closed.");
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

async function insertPokemon(db) {
  data.forEach((pokemon) => {
    const stmt = db.prepare("INSERT INTO pokemon (name, url) VALUES (?, ?)");
    stmt.run(pokemon.name, pokemon.url);
    stmt.finalize();
  });
}
