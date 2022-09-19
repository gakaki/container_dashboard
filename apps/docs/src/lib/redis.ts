import Redis from 'ioredis'
import RedisConnectionPool, { RedisConnectionPoolConfig } from 'redis-connection-pool';
const url = "redis://default:50icRL0ZVXIf3f5cKtwg4UuEYb5NGXvc@redis-17665.c53.west-us.azure.cloud.redislabs.com:17665"
// //process.env.REDIS_URL
const redis = new Redis(url)

export default redis
// // const cfg:RedisConnectionPoolConfig = {
// //     max_clients: 5, // default
// //     redis: {
// //       url: url
// //     }
// // }
// // const uid1 = "uid1"
// // const redisPool =  RedisConnectionPool( uid1 , cfg );


// import redisPoolFactory from 'redis-connection-pool';
// const redisPool = await redisPoolFactory('myRedisPool', {
//     max_clients: 35, // default
//     perform_checks: true,
//     redis: {
//       url: url
//     }
//   });

//   export default redisPool