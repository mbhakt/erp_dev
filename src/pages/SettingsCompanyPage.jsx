import React from 'react';
import AppLayout from '../components/AppLayout';
import { Form, Input, Button, Card, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function SettingsCompanyPage(){
  const [form] = Form.useForm();
  const onFinish = (vals) => {
    console.log('save', vals);
  };
  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Company Profile</h2>
        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{company_name:'Your Company', gstin:''}}>
            <Form.Item name="company_name" label="Company Name"><Input /></Form.Item>
            <Form.Item name="gstin" label="GSTIN"><Input /></Form.Item>
            <Form.Item name="address" label="Address"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="logo" label="Logo"><Upload><Button icon={<UploadOutlined />}>Upload Logo</Button></Upload></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit">Save Company</Button></Form.Item>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}