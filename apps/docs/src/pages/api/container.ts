import type { NextApiRequest, NextApiResponse } from 'next'
import redis from '../../lib/redis'






export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
    
    const v = await redis.get('container')
    res.status(200).send(v)



    
        // res.status(200).json({ name: 'John Doe' })

}

// http://localhost:3001/api/container