import Redis from 'ioredis'

const url = "redis://default:50icRL0ZVXIf3f5cKtwg4UuEYb5NGXvc@redis-17665.c53.west-us.azure.cloud.redislabs.com:17665"
//process.env.REDIS_URL
const redis = new Redis(url)

export default redis