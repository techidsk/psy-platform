require('dotenv').config()
const { Snowflake } = require('nodejs-snowflake');
const connection = require('../server/connection')
const uid = new Snowflake({
    custom_epoch: parseInt(process.env.SNOWFLAKE_EPOCH),
    instance_id: 0 // A value ranging between 0 - 4095. If not provided then a random value will be used
});


// const initUser = (connection, DataTypes) => {
//     class User extends Model { }

//     User.init({
//         id: {
//             type: DataTypes.BIGINT,
//             primaryKey: true,
//             allowNull: false
//         },
//         username: {
//             type: DataTypes.STRING,
//         },
//         password: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         email: {
//             type: DataTypes.STRING,
//             validate: {
//                 isEmail: true,   //类型检测,是否是邮箱格式
//             }
//         },
//         tel: {
//             type: DataTypes.STRING,
//         },
//         avatar: {
//             type: DataTypes.STRING,
//         },
//         user_role: {
//             type: DataTypes.STRING,
//             defaultValue: 'USER'
//         },
//         salt: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         user_group_id: {
//             type: DataTypes.BIGINT,
//         },
//     }, {
//         // Other model options go here
//         sequelize: connection, // We need to pass the connection instance
//         modelName: 'User', // We need to choose the model name
//         tableName: 'psy_user',
//         timestamps: false
//     })
//     return User;
// }

// const user = User.build({
//     id: uid.getUniqueID(),
//     password: '123456',
//     email: 'ecpknymt2@gmail.com',
//     salt: 'salt'
// })
// console.log(user.id, user.username)
// async function save() {
//     await user.save()
// }
// // save()
// async function all() {
//     const users = await User.findAll()
//     console.log(users.every(user => user instanceof User)); // true
//     console.log("All users:", JSON.stringify(users, null, 2));
// }

// all()
// module.exports = (connection) => initUser(connection)
// module.exports = initUser(connection, DataTypes);

// const u = initUser(connection, DataTypes);
// async function c(){
//     const users = await u.findAll();
//     console.log("All users:", JSON.stringify(users, null, 2));
// }
// c()
