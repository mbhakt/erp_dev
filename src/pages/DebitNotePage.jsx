import React from "react";
import AppLayout from "../components/AppLayout";
import { Card } from "antd";
export default function DebitNotePage(){
  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Purchase Note / Debit Note</h1>
        </div>
        <Card>
          <div className="card-empty">Debit Note UI placeholder</div>
        </Card>
      </div>
    </AppLayout>
  );
}