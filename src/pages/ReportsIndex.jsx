import React from "react";
import { Card, Button } from "antd";
export default function ReportsIndex(){
  return (
    <Card title="Reports">
      <div className="card-empty">
        Reports hub — Daybook, Sale Report, Party Statement.
        <div style={{marginTop:12}}>
          <Button>Sale Report</Button>
          <Button style={{marginLeft:8}}>Daybook</Button>
          <Button style={{marginLeft:8}}>Party Statement</Button>
        </div>
      </div>
    </Card>
  );
}