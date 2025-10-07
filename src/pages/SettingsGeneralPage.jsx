import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Form, Input, Button } from "antd";
export default function SettingsGeneralPage(){
  const [form] = Form.useForm();
  return (
    <AppLayout>
      <Card title="Settings — General">
        <Form form={form} layout="vertical" initialValues={{ company:'Mahalasa', gst:'', address:'' }}>
          <Form.Item name="company" label="Company Name"><Input/></Form.Item>
          <Form.Item name="gst" label="GSTIN"><Input/></Form.Item>
          <Form.Item name="address" label="Address"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item><Button type="primary">Save</Button></Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
}