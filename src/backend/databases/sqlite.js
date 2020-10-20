const Sequelize = require("sequelize");
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./src/backend/databases/database.sqlite"
});

const User = sequelize.define('users',{
    name: {
        type: Sequelize.STRING,
        allownull: false
    },
    email: {
        type: Sequelize.STRING,
        allownull: false
    },
    password: {
        type: Sequelize.STRING,
        allownull: false
    },
    gender: {
        type: Sequelize.STRING,
        allownull: false
    },
    date: {
        type: Sequelize.STRING,
        allownull: false
    },
    phone: {
        type: Sequelize.NUMBER,
        allownull: false
    },
    city: {
        type: Sequelize.STRING,
        allownull: false
    },
    state: {
        type: Sequelize.STRING,
        allownull:false
    },
    country: {
        type: Sequelize.STRING,
        allownull: false
    }
});
