import React from "react";
import { Card, Form, InputNumber, Button } from "antd";
export default function SettingsGSTPage(){
  const [form] = Form.useForm();
  return (
    <Card title="Settings — Taxes & GST">
      <Form form={form} layout="vertical" initialValues={{ cgst:9, sgst:9 }}>
        <Form.Item name="cgst" label="CGST (%)"><InputNumber min={0} max={100} /></Form.Item>
        <Form.Item name="sgst" label="SGST (%)"><InputNumber min={0} max={100} /></Form.Item>
        <Form.Item><Button type="primary">Save</Button></Form.Item>
      </Form>
    </Card>
  );
}