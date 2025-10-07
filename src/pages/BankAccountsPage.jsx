import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { Card, Table, Button, Spin } from "antd";
import { currencyINR } from "../utils/format";

const mock = [
  { id:1, name:'Axis Bank', account:'1234567890', balance:50000 },
  { id:2, name:'HDFC', account:'9876543210', balance:120000 }
];

export default function BankAccountsPage(){
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ setLoading(true); setTimeout(()=>{ setData(mock); setLoading(false); }, 250); },[]);
  const columns = [
    { title:'Bank', dataIndex:'name' },
    { title:'Account', dataIndex:'account' },
    { title:'Balance', dataIndex:'balance', render: b=>currencyINR(b) },
    { title:'Actions', key:'a', render: ()=> <Button size="small">Edit</Button> }
  ];
  return <AppLayout><h2>Bank Accounts</h2><Card>{loading ? <Spin/> : <Table dataSource={data} columns={columns} rowKey="id" />}</Card></AppLayout>;
}