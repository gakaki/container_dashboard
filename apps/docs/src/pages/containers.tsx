import Head from "next/head";
import { Button } from "ui";

import NextLink from "next/link"; 
import { GetServerSideProps, GetServerSidePropsContext, PreviewData } from "next/types";

import redis from '../lib/redis'
import { ParsedUrlQuery } from "querystring";

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



export const getServerSideProps: GetServerSideProps = async (context) => {

    const str   = await redis.get('container')
    // console.dir(res)
    // console.log(res)
    const data = JSON.parse(str)
    console.log("services length",data.services.length)
    
    let ip;
    const { req } = context;

    let x_forward_for = req.headers["x-forwarded-for"] as string
    if ( x_forward_for) {  

      if (typeof x_forward_for === 'string' && x_forward_for.length > 0) { 
        ip = x_forward_for.split(',')[0]
      }
      
    } else if (req.headers["x-real-ip"]) {
      ip = req.socket.remoteAddress
    } else {
      ip = req.socket.remoteAddress
    }
  
    console.log(ip)
    data.ip = ip

  return {
    props: {
      data
    },
  };
};

const which_is_sl = (data:DataRoot) => {
  if (data.which_prod_is_live == "B") {
    return "A"
  }
  return "B"
}

export default function Home({ data }: { data: DataRoot }) {
  return (
    <div className="bg-white flex min-h-screen flex-col items-center justify-center py-2">
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
          <h1>SL: { which_is_sl(data) } Production: { data.which_prod_is_live } </h1>
          <hr />
          <h3>
            ip : { data.ip } 
          </h3>

          {data.services?.map((service) => {
            return (
              <div key={service.serviceName}>
                <h2>{service.serviceName}</h2>

                <a>
                  <h2>{service.latest.versionNum}</h2>
                </a>
              </div>
            );
          })}


          
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

        <div className="mx-auto mt-5 max-w-xl sm:flex sm:justify-center md:mt-8">
          <Button />
        </div>

      </main>



    </div>
  );
}
