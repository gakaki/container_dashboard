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
import { debug } from "console";
 
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
  columns_equal : Object
}


type Column = {
  name :string 
  is_equal: boolean
  env_values : string[]
}

type ColumnRow =  {
  name : string
  env : string
  content: string
  compare_content: string

}


class ColumnTable { 

  columns        = new Array<Column>
  env_rows       = new Map<string,Map<string,ColumnRow[]>>
  columns_equal  = new Map<string,boolean>
  env_names      = new Array<string>

  is_column_equal(column:string) {
    return this.columns_equal[column]
  }

  constructor( data : EtcdRoot ) {

      this.env_names              = data.env_names
      
      let column_values: string[] = []

      for ( let column_name of data.columns ){

        for ( let env_name of this.env_names ){

            let v = data.envEtcdMap[env_name].map_kv[column_name]
            column_values.push(v)

            if ( !this.env_rows.has(env_name)  ){
              this.env_rows[env_name] = new Map<string,ColumnRow[]>
            }
            
            this.env_rows[env_name].set(column_name,{
              name : column_name,
              env: env_name,
              content:  v
            })

            // console.log(this.env_rows[column_name])
        }

        this.columns_equal[column_name] =  all_equal(column_values)

        this.columns.push({
          name        : column_name,
          is_equal    : this.columns_equal[column_name],
          env_values  : column_values
        })

      }
  }

  output(){
    return {
      columns: this.columns,
      env_rows: this.env_rows,
      columns_equal: this.columns_equal,
      env_names: this.env_names
    }
  }
}

const json_str = `{"code":0,"data":{"name":"shdr-acp-service","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service","envEtcdMap":{"mdx-cs-latest-ali":{"env":"latest","full_name":"mdx-cs-latest-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-latest-ali/instance-0","map_kv":{"API_TOKEN":"4e23f969a12fc0939916a6cc03a7a3f7460dfe87","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"http://shdr-gms-admin.content:8080","NODE_ENV":"LT","REDIS_HOST":"r-uf6bd70630579ee4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"600","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"e243e96d3631aea3","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}},"mdx-cs-lt01-ali":{"env":"lt","full_name":"mdx-cs-lt01-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-lt01-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","APP_DYNAMICS":"true","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.cslt01.shdrapps.disney.com","NODE_ENV":"LT","PROFILER_ACCOUNT_ACCESS_KEY":"ca80841c29c2","PROFILER_ACCOUNT_NAME":"Disney-PreProd","PROFILER_APP_NAME":"ali_load_SHDR_Parks","PROFILER_AUTOSNAPSHOTDURATIONSECONDS":"10","PROFILER_CONTROLLER_HOST_NAME":"Disney-PreProd.saas.appdynamics.com","PROFILER_CONTROLLER_PORT":"443","PROFILER_CONTROLLER_SSL_ENABLED":"true","PROFILER_ENABLED":"true","PROFILER_MAXPROCESSSNAPSHOTSPERPERIOD":"2","PROFILER_PROCESSSNAPSHOTCOUNTRESETPERIODSECONDS":"60","PROFILER_PROCESS_NAME":"LT","PROFILER_TIER_NAME":"digital_shdr-acp-service-k8s","REDIS_HOST":"r-uf643ac564a21224.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"7200","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-25","user.timezone":"Asia/Shanghai"}},"mdx-cs-lt01asm-ali":{"env":"lt","full_name":"mdx-cs-lt01asm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-lt01asm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","APP_DYNAMICS":"true","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.cslt01.shdrapps.disney.com","NODE_ENV":"LT","PROFILER_ACCOUNT_ACCESS_KEY":"ca80841c29c2","PROFILER_ACCOUNT_NAME":"Disney-PreProd","PROFILER_APP_NAME":"ali_load_SHDR_Parks","PROFILER_AUTOSNAPSHOTDURATIONSECONDS":"10","PROFILER_CONTROLLER_HOST_NAME":"Disney-PreProd.saas.appdynamics.com","PROFILER_CONTROLLER_PORT":"443","PROFILER_CONTROLLER_SSL_ENABLED":"true","PROFILER_ENABLED":"true","PROFILER_MAXPROCESSSNAPSHOTSPERPERIOD":"2","PROFILER_PROCESSSNAPSHOTCOUNTRESETPERIODSECONDS":"60","PROFILER_PROCESS_NAME":"LT","PROFILER_TIER_NAME":"digital_shdr-acp-service-k8s","REDIS_HOST":"r-uf643ac564a21224.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"7200","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-25","user.timezone":"Asia/Shanghai"}},"mdx-cs-proda-ali":{"env":"proda","full_name":"mdx-cs-proda-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-proda-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csproda.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},"mdx-cs-prodb-ali":{"env":"prodb","full_name":"mdx-cs-prodb-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-prodb-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csprodb.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},"mdx-cs-stage-ali":{"env":"stage","full_name":"mdx-cs-stage-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-stage-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csstage.shdrapps.disney.com","NODE_ENV":"STG","REDIS_HOST":"r-uf639b8b458038f4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"300","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}},"mdx-cs-stageasm-ali":{"env":"stage","full_name":"mdx-cs-stageasm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-stageasm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csstage.shdrapps.disney.com","NODE_ENV":"STG","REDIS_HOST":"r-uf639b8b458038f4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"300","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}}},"envEnvEtcdMap":{"latest":{"env":"latest","full_name":"mdx-cs-latest-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-latest-ali/instance-0","map_kv":{"API_TOKEN":"4e23f969a12fc0939916a6cc03a7a3f7460dfe87","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"http://shdr-gms-admin.content:8080","NODE_ENV":"LT","REDIS_HOST":"r-uf6bd70630579ee4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"600","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"e243e96d3631aea3","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}},"lt":{"env":"lt","full_name":"mdx-cs-lt01asm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-lt01asm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","APP_DYNAMICS":"true","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.cslt01.shdrapps.disney.com","NODE_ENV":"LT","PROFILER_ACCOUNT_ACCESS_KEY":"ca80841c29c2","PROFILER_ACCOUNT_NAME":"Disney-PreProd","PROFILER_APP_NAME":"ali_load_SHDR_Parks","PROFILER_AUTOSNAPSHOTDURATIONSECONDS":"10","PROFILER_CONTROLLER_HOST_NAME":"Disney-PreProd.saas.appdynamics.com","PROFILER_CONTROLLER_PORT":"443","PROFILER_CONTROLLER_SSL_ENABLED":"true","PROFILER_ENABLED":"true","PROFILER_MAXPROCESSSNAPSHOTSPERPERIOD":"2","PROFILER_PROCESSSNAPSHOTCOUNTRESETPERIODSECONDS":"60","PROFILER_PROCESS_NAME":"LT","PROFILER_TIER_NAME":"digital_shdr-acp-service-k8s","REDIS_HOST":"r-uf643ac564a21224.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"7200","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-25","user.timezone":"Asia/Shanghai"}},"proda":{"env":"proda","full_name":"mdx-cs-proda-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-proda-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csproda.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},"prodb":{"env":"prodb","full_name":"mdx-cs-prodb-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-prodb-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csprodb.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},"stage":{"env":"stage","full_name":"mdx-cs-stageasm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-stageasm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csstage.shdrapps.disney.com","NODE_ENV":"STG","REDIS_HOST":"r-uf639b8b458038f4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"300","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}}},"envEtcds":[{"env":"latest","full_name":"mdx-cs-latest-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-latest-ali/instance-0","map_kv":{"API_TOKEN":"4e23f969a12fc0939916a6cc03a7a3f7460dfe87","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"http://shdr-gms-admin.content:8080","NODE_ENV":"LT","REDIS_HOST":"r-uf6bd70630579ee4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"600","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"e243e96d3631aea3","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}},{"env":"lt","full_name":"mdx-cs-lt01-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-lt01-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","APP_DYNAMICS":"true","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.cslt01.shdrapps.disney.com","NODE_ENV":"LT","PROFILER_ACCOUNT_ACCESS_KEY":"ca80841c29c2","PROFILER_ACCOUNT_NAME":"Disney-PreProd","PROFILER_APP_NAME":"ali_load_SHDR_Parks","PROFILER_AUTOSNAPSHOTDURATIONSECONDS":"10","PROFILER_CONTROLLER_HOST_NAME":"Disney-PreProd.saas.appdynamics.com","PROFILER_CONTROLLER_PORT":"443","PROFILER_CONTROLLER_SSL_ENABLED":"true","PROFILER_ENABLED":"true","PROFILER_MAXPROCESSSNAPSHOTSPERPERIOD":"2","PROFILER_PROCESSSNAPSHOTCOUNTRESETPERIODSECONDS":"60","PROFILER_PROCESS_NAME":"LT","PROFILER_TIER_NAME":"digital_shdr-acp-service-k8s","REDIS_HOST":"r-uf643ac564a21224.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"7200","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-25","user.timezone":"Asia/Shanghai"}},{"env":"lt","full_name":"mdx-cs-lt01asm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-lt01asm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","APP_DYNAMICS":"true","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.cslt01.shdrapps.disney.com","NODE_ENV":"LT","PROFILER_ACCOUNT_ACCESS_KEY":"ca80841c29c2","PROFILER_ACCOUNT_NAME":"Disney-PreProd","PROFILER_APP_NAME":"ali_load_SHDR_Parks","PROFILER_AUTOSNAPSHOTDURATIONSECONDS":"10","PROFILER_CONTROLLER_HOST_NAME":"Disney-PreProd.saas.appdynamics.com","PROFILER_CONTROLLER_PORT":"443","PROFILER_CONTROLLER_SSL_ENABLED":"true","PROFILER_ENABLED":"true","PROFILER_MAXPROCESSSNAPSHOTSPERPERIOD":"2","PROFILER_PROCESSSNAPSHOTCOUNTRESETPERIODSECONDS":"60","PROFILER_PROCESS_NAME":"LT","PROFILER_TIER_NAME":"digital_shdr-acp-service-k8s","REDIS_HOST":"r-uf643ac564a21224.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"7200","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-25","user.timezone":"Asia/Shanghai"}},{"env":"proda","full_name":"mdx-cs-proda-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-proda-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csproda.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},{"env":"prodb","full_name":"mdx-cs-prodb-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-prodb-ali/instance-0","map_kv":{"API_TOKEN":"510ff6ef02b37e2e17d49f9f8994d2d062614b43","CDN":"https://static.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csprodb.shdrapps.disney.com","NODE_ENV":"PRD","REDIS_HOST":"r-uf63493549fee2c4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"86400","SHDRMW_PROJECT":"1c6d85747f191131","k8s.docker.image.tag":"1.0.0-6","user.timezone":"Asia/Shanghai"}},{"env":"stage","full_name":"mdx-cs-stage-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-stage-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csstage.shdrapps.disney.com","NODE_ENV":"STG","REDIS_HOST":"r-uf639b8b458038f4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"300","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}},{"env":"stage","full_name":"mdx-cs-stageasm-ali","url":"https://keyblade.shdrapps.disney.com/etcd/api/v1/dir/sh1/application/shdr-acp-service/mdx-cs-stageasm-ali/instance-0","map_kv":{"API_TOKEN":"559ac1e48482ece79945d95d1a11b3341b1b621f","CDN":"https://static-le.shanghaidisneyresort.com","GMS_ENVIRONMENT":"latest","GMS_HOST":"https://gms-admin.csstage.shdrapps.disney.com","NODE_ENV":"STG","REDIS_HOST":"r-uf639b8b458038f4.redis.rds.aliyuncs.com","REDIS_PORT":"6379","SERVER_PORT":"8080","SHDRMW_CACHETIME":"300","SHDRMW_CONTENT":"9b41a32ee8682c5f","SHDRMW_PROJECT":"6cede6bea6fadd38","k8s.docker.image.tag":"1.0.0-30","user.timezone":"Asia/Shanghai"}}]},"msg":"ok"}`

export const getServerSideProps: GetServerSideProps = async (context) => {
  // await redisPool.init()
  // const str = await redisPool.get('container')
  // const str = await redis.get('container')
  const { service_name } = context.query;

  // const res = await fetch(`http://localhost:9999/etcd/${service_name}`)
  // const json = await res.json()
  const j = JSON.parse(json_str)
  
  // console.dir(res)
  const data = j.data as EtcdRoot

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
  // console.log(columns.length,columns)

  data.env_names  = Object.keys(data.envEtcdMap),
  data.columns    = columns
  data.columns_equal = {}
  const all_equal             = array => array.every( el => el === array[0] )
  for ( let column_name of data.columns ){
    let column_values: string[] = []
    for ( let env_name of data.env_names ){
        let v = data.envEtcdMap[env_name].map_kv[column_name]
        // console.log(column_name,v)
        column_values.push(v)
    }
    data.columns_equal[column_name] =  all_equal(column_values)
  }
  
  return {
    props: {
      data
    },
  };
};

export default function Etcd({ data }: { data:EtcdRoot  }) {
  
  console.log("columns equal",Object.keys(data.columns_equal),data.columns_equal,data.columns_equal["PROFILER_CONTROLLER_SSL_ENABLED"])
  
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
            {/* <div>
              {Object.keys(data.columns_equal).map((key,index) => {
                  return (
                    <div key={key + index}>
                      {key}:{ data.columns_equal[key].toString()}
                    </div>
                  )
                })}
            </div> */}


            <hr />

            <div className="w-72 overflow-x-scroll">
              
              {/* column table  table column title need a column */}
              <div className="h-10"> column / env_name </div>
              {data.columns?.map((column) => {
                  return (
                    <div className="h-10">
                      {column}
                      {/* { data.columns_equal[column].toString()} */}
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
                          {/* { data.columns_equal[column].toString()} */}
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
