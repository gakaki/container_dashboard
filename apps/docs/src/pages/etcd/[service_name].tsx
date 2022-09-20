import Head from "next/head";
import { Button } from "ui";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

import NextLink from "next/link";
import { GetServerSideProps, GetServerSidePropsContext, PreviewData } from "next/types";

import redis from '../../lib/redis'
import { ParsedUrlQuery } from "querystring";
import redisPool from "../../lib/redis";
import Link from "next/link";
import { resourceLimits } from "worker_threads";
 
type MapKv = Map<string, string> 

type EtcdMapItem =  {
  env: string
  full_name: string
  url: string
  map_kv: MapKv
}

type EnvEtcdMap =  Map<string, EtcdMapItem> 

type EtcdRoot = {
  name: string
  url: string
  envEtcdMap: EnvEtcdMap
  envEnvEtcdMap: EnvEtcdMap
  envEtcds: EtcdMapItem[],

  columns: string[],
  env_names: string[],
}

type EtcdData = {
 
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // await redisPool.init()
  // const str = await redisPool.get('container')
  // const str = await redis.get('container')
  const { service_name } = context.query;

  const res = await fetch(`http://localhost:9999/etcd/${service_name}`)
  const json = await res.json()
  // console.dir(res)
  const data = json.data as EtcdRoot

  if (data.envEtcds.length <= 0){
    console.error("not found etcd length")
  }else{
    console.log("data length >>", data.envEtcds.length)
  }


  const tmp_columns: string[] = []
  for (let env_name in data.envEnvEtcdMap){
    const kv    = data.envEnvEtcdMap[env_name].map_kv
    tmp_columns.push(...Object.keys(kv))
  }

  const columns = Array.from(new Set(tmp_columns)).sort()
  console.log(columns.length,columns)

  data.env_names  = Object.keys(data.envEtcdMap),
  data.columns    = columns
  
  return {
    props: {
      data
    },
  };
};

export default function Etcd({ data }: { data:EtcdRoot  }) {

  // make router to server query id
  // const router = useRouter()
  // const { service_name } = router.query

  // useEffect(() => {
  //   const fetchData = async () => {
  //     let filtered_data = data.services.filter( s => s.serviceName.toLowerCase().includes((query) ) )
  //     setServiceData(filtered_data);
  //   };
  //   if (query.length === 0 || query.length > 2) fetchData();
  // }, [query]);

  return (
    <div className="bg-white py-2">
      <Head>
        <title>SHDR Container Status</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
        
        <div className="flex space-x-4">
            <Link target="_blank" href={`https://keyblade.shdrapps.disney.com/keys/sh1/application/${data.name}`}>{data.name}</Link>
        </div>

        <hr />
        <div className="flex">

            <div className="w-72 overflow-x-scroll">
              {/* column table  table column title need a column */}
              <div className="h-10"> column / env_name </div>
              {data.columns?.map((column) => {
                  return (
                    <div className="h-10">
                      {column}
                    </div>
                  );
              })}
            </div>
            
            {/* for earch all envs */}
            {data.env_names?.map((env_name) => {
                  return (
                    <div className="w-72 overflow-x-scroll">
                    {/* column table  table column title need a column */}
                    <div className="h-10"> { env_name } </div>

                    { data.columns?.map((column) => {

                      return (
                        <div className="h-10">
                          {data.envEtcdMap[env_name].map_kv[column] }
                        </div>
                      );

                    })}

                  </div>
                  );
            })}

        </div>
      </main>

    </div>
  )

}
