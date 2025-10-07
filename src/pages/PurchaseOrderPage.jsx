import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Button } from "antd";
export default function PurchaseOrderPage(){
  return (
    <AppLayout>
      <Card title="Purchase Orders" extra={<Button type="primary">+ Add Order</Button>}>
        <div style={{padding:20}}>Purchase Orders UI placeholder — will be wired to your backend.</div>
      </Card>
    </AppLayout>
  );
}