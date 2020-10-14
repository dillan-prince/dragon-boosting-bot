import Sequelize from 'sequelize';

import { Keys } from '../config/index.js';

const {
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT
} = await Keys();

const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        dialect: 'mysql'
    }
);

export const User = sequelize.define(
    'User',
    {
        userId: {
            type: Sequelize.DataTypes.STRING,
            primaryKey: true
        },
        balance: {
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
);

(async () => {
    await sequelize.sync();
})();

export default sequelize;
