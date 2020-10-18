import Sequelize from 'sequelize';
import mysql from 'mysql2/promise';

import { Keys } from '../config/index.js';

const {
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT
} = await Keys();

const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD
});

await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};`);

const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        dialect: 'mysql',
        ssl: 'Amazon RDS'
    }
);

export const User = sequelize.define('User', {
    userId: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
    },
    balance: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
});

export const Role = sequelize.define('Role', {
    roleId: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    percentageCut: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
});

(async () => {
    await sequelize.sync({ alter: true });
})();

export default sequelize;
