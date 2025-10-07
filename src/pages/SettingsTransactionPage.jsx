import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Form, Select, Button } from "antd";
export default function SettingsTransactionPage(){
  const [form] = Form.useForm();
  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Settings - Transaction</h1>
        </div>
    <Card>
      <Form form={form} layout="vertical" initialValues={{ numbering:'auto' }}>
        <Form.Item name="numbering" label="Invoice Numbering">
          <Select><Select.Option value="auto">Auto</Select.Option><Select.Option value="manual">Manual</Select.Option></Select>
        </Form.Item>
        <Form.Item><Button type="primary">Save</Button></Form.Item>
      </Form>
    </Card>
      </div>
    </AppLayout>
  );
}