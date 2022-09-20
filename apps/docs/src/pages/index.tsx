import Head from "next/head";
import { Button } from "ui";
import { useEffect, useState } from "react";

import NextLink from "next/link";
import { GetServerSideProps, GetServerSidePropsContext, PreviewData } from "next/types";

import redis from '../lib/redis'
import { ParsedUrlQuery } from "querystring";
import redisPool from "../lib/redis";
import Link from "next/link";

type DataRoot = {
  liveProduction: string
  is_prod_a_live: boolean
  is_prod_b_live: boolean
  which_prod_is_live: string
  name: string
  services: DataService[]
  ip: string
};

type DataService = {
  serviceName: string
  envs: DataServiceItem[]
  latest: DataServiceItem
  stage: DataServiceItem
  lt01: DataServiceItem
  lt: DataServiceItem
  lt_asm: DataServiceItem
  prod: DataServiceItem
  isOnlyProdNoProdAB: boolean
  proda: DataServiceItem
  prodb: DataServiceItem
}

type DataServiceItem = {
  serviceName: string
  envName: string
  versionNum: string
  podNum: string
  etcdLink: string
}

const get_ip = (context: any): string => {
  let ip;
  const { req } = context;

  let x_forward_for = req.headers["x-forwarded-for"] as string
  if (x_forward_for) {

    if (typeof x_forward_for === 'string' && x_forward_for.length > 0) {
      ip = x_forward_for.split(',')[0]
    }

  } else if (req.headers["x-real-ip"]) {
    ip = req.socket.remoteAddress
  } else {
    ip = req.socket.remoteAddress
  }
  // console.log("ip address is ", ip)
  return ip
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // await redisPool.init()
  // const str = await redisPool.get('container')
  // const str = await redis.get('container')
  const res = await fetch("http://localhost:9999/service")
  const json = await res.json()
  // console.dir(res)
  // console.log(json)
  const data = json.data
  // console.log("services length >>", data.services.length)
  data.ip = get_ip(context)

  return {
    props: {
      data
    },
  };
};

const which_is_sl = (data: DataRoot) => {
  if (data.which_prod_is_live == "B") {
    return "A"
  }
  return "B"
}

export default function Home({ data }: { data: DataRoot }) {

  const [query, setQuery]             = useState("");
  const [serviceData, setServiceData] = useState<DataService[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let filtered_data = data.services.filter( s => s.serviceName.toLowerCase().includes((query) ) )
      setServiceData(filtered_data);
    };
    if (query.length === 0 || query.length > 2) fetchData();
  }, [query]);


  return (
    <div className="bg-white py-2">
      <Head>
        <title>SHDR Container Status</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">

        <h1 className="mx-auto max-w-6xl text-center text-6xl font-extrabold leading-[1.1] tracking-tighter text-white sm:text-6xl lg:text-8xl xl:text-8xl">
          <span className="inline-block bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent ">
            SHDR Container Status
          </span>{" "}
        </h1>

        <div style={{ padding: 20 }}>
          
          <div className="pl-9 pr-9 flex items-center text-2xl  space-x-14 gap-0.5">
            <h1>SL: prod_{which_is_sl(data)} </h1>
            <h1>Production: prod_{data.which_prod_is_live} </h1>
            <h1>
              Your ip address : {data.ip}
            </h1>
          </div>

          <hr />

          <div className="pl-9 pr-9 flex items-center text-2xl  space-x-14 gap-0.5">
            <input
              className="search"
              placeholder="Search..."
              onChange={(e) => setQuery(e.target.value.toLowerCase())}
            />
          </div>

          <div className="p-8">
            <table className="table-auto border-x border-b">
              <thead>
                <tr>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 p-2 text-left font-bold text-white">
                    Service
                  </th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 p-2 text-left font-bold text-white">Latest</th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 p-2 text-left font-bold text-white">Stage</th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 p-2 text-left font-bold text-white">Lt01</th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 p-2 text-left font-bold text-white">Prod</th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 py-2 px-4 text-left font-bold text-white">ProdA</th>
                  <th className="border-b border-l border-indigo-700 bg-indigo-700 py-2 px-4 text-left font-bold text-white">ProdB</th>
                </tr>
              </thead>
              <tbody>

              {serviceData?.map((service) => {
                  return (

                    <tr className="odd:bg-gray-100 hover:!bg-stone-200">
                      <td className="border-b border-l p-2 text-left">
                        <a className="text-black-400" target="_blank" href={`/etcd/${service.serviceName}`}> {service.serviceName} </a>
                      </td>
                      <td className="border-b border-l p-2 text-left">
                        
                        {service.envs['latest'].versionNum}

                        {/* [{service.envs['latest'].podNum}] */}

                      </td>

                      <td className="border-b border-l p-2 text-left">{service.envs['stage'].versionNum}</td>
                      {/* <td className="border-b border-l p-2 text-left">{service.envs['stageasm']?.versionNum}</td> */}

                      <td className="border-b border-l p-2 text-left">{service.envs['lt01'].versionNum}</td>
                      {/* <td className="border-b border-l p-2 text-left">{service.envs['lt01asm']?.versionNum}</td> */}

                      <td className="border-b border-l p-2 text-left">{service.envs['prod'].versionNum}</td>
                      <td className="border-b border-l p-2 text-left">{service.envs['proda'].versionNum}</td>
                      <td className="border-b border-l p-2 text-left">{service.envs['prodb'].versionNum}</td>

                    </tr>
                    
                  );
              })}

              </tbody>
            </table>
          </div>



          {/* {data.services?.map((service) => {
            return (
              <div key={service.serviceName}>
                <h2>{service.serviceName}</h2>

                <a>
                  <h2>{service.latest.versionNum}</h2>
                </a>
              </div>
            );
          })}
 */}


          {/* {posts?.map((post) => {
            return (
              <div key={post?.id}>
                <a href={`/posts/${post?.id}`}>
                  <h2>{post.title}</h2>
                </a>
              </div>
            );
          })} */}
        </div>

        {/* <div className="mx-auto mt-5 max-w-xl sm:flex sm:justify-center md:mt-8">
          <Button />
        </div> */}

      </main>



    </div>
  );
}
