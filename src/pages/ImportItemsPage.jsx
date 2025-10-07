import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
export default function ImportItemsPage(){ return <AppLayout><Card title="Import Items"><div className="card-empty">Upload CSV/Excel to import items.<div style={{marginTop:12}}><Upload><Button icon={<UploadOutlined/>}>Upload File</Button></Upload></div></div></Card></AppLayout>; }