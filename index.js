const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const {
  fetchUsers,
  createTables,
  createProduct,
  createUser,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
  seed
} = require("./server/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/api/users", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/users/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  try {
    const favorites = await fetchFavorites(userId);
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/users/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const { product_id } = req.body;
  try {
    const favorite = await createFavorite(userId, product_id);
    res.status(201).json(favorite);
  } catch (error) {
    console.error("Error creating favorite:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res) => {
  const userId = req.params.userId;
  const favoriteId = req.params.id;
  try {
    await destroyFavorite(userId, favoriteId);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const init = async () => {
  try {
    await createTables();
    console.log("Database initialized successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    await seed ();
    console.log('data seeded');
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

init();
