const pg = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const client = new pg.Client({
    connectionString:
    process.env.DATABASE_URL || `postgres://localhost/${process.env.DB_NAME}`,
});

const createTables = async () => {
    try {
        await client.connect();

        const createTablesQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username VARCHAR(100) UNIQUE,
                password VARCHAR(100)
            );

            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY,
                name VARCHAR(100)
            );

            CREATE TABLE IF NOT EXISTS favorites (
                id UUID PRIMARY KEY,
                product_id UUID REFERENCES products(id),
                user_id UUID REFERENCES users(id),
                CONSTRAINT unique_favorite UNIQUE (product_id, user_id)
            );
        `;

        await client.query(createTablesQuery);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

const createProduct = async (name) => {
    try {
        const id = uuidv4();
        const query = 'INSERT INTO products (id, name) VALUES ($1, $2) RETURNING *';
        const result = await client.query(query, [id, name]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

const createUser = async (username, password) => {
    try {
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [id, username, hashedPassword]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

const fetchUsers = async () => {
    try {
        const query = 'SELECT * FROM users';
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const fetchProducts = async () => {
    try {
        const query = 'SELECT * FROM products';
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

const createFavorite = async (userId, productId) => {
    try {
        const id = uuidv4();
        const query = 'INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [id, userId, productId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating favorite:', error);
        throw error;
    }
};

const fetchFavorites = async (userId) => {
    try {
        const query = 'SELECT * FROM favorites WHERE user_id = $1';
        const result = await client.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

const destroyFavorite = async (userId, favoriteId) => {
    try {
        const query = 'DELETE FROM favorites WHERE user_id = $1 AND id = $2';
        await client.query(query, [userId, favoriteId]);
        console.log('Favorite deleted successfully');
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
};

const seed = async () => {
    try {
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Erro seeding data:', error);
        throw error;
    }
};

module.exports = {
    client,
    createTables,
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite,
    seed
};
