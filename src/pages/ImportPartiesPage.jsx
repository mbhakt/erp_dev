import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
export default function ImportPartiesPage(){
  return (
    <AppLayout>
       <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Import Parties</h1>
        </div>
    <Card>
      <div className="card-empty">
        Upload CSV/Excel to import parties.
        <div style={{marginTop:12}}>
          <Upload><Button icon={<UploadOutlined/>}>Upload File</Button></Upload>
        </div>
      </div>
    </Card>
      </div>
    </AppLayout>
  );
}