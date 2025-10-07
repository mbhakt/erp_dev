import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Button } from "antd";
export default function ExportTallyPage(){
  return (
    <AppLayout>
        <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Export to Tally</h1>
        </div>
    <Card>
      <div className="card-empty">
        Export options for Tally (XML) and CSV.
        <div style={{marginTop:12}}><Button>Export XML</Button><Button style={{marginLeft:8}}>Export CSV</Button></div>
      </div>
    </Card>
      </div>
    </AppLayout>
  );
}