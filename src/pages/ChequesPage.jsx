import React from "react";
import AppLayout from "../components/AppLayout";
import { Card } from "antd";
export default function ChequesPage(){
  return (
    <AppLayout>
        <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Cheques Page</h1>
        </div>
      <Card>
        <div className="card-empty">Cheques management placeholder (received/cleared/bounced)</div>
      </Card>
        </div>
    </AppLayout>
  );
}