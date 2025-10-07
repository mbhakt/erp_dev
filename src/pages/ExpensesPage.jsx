import React, {useEffect, useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Card, Table, Button, Modal, Form, InputNumber, Input, DatePicker, message } from 'antd';
import BottomButtonBar from '../components/BottomButtonBar';
import * as api from '../api/index';
import dayjs from 'dayjs';
import { currencyINR } from '../utils/currencyINR';

export default function ExpensesPage(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(()=>{ load(); },[]);
  async function load(){ setLoading(true); try{ const res = await api.getExpenses(); setRows(res||[]); }catch(e){console.error(e);} setLoading(false); }

  const openAdd = ()=>{ setEditing(null); form.resetFields(); form.setFieldsValue({date: dayjs()}); Modal.confirm = undefined; Modal.info; Modal.confirm; Modal.success; Modal.error; }
  const handleSave = async (stay)=> {
    try{
      const vals = await form.validateFields();
      setSaving(true);
      const payload = { date: vals.date ? vals.date.format('YYYY-MM-DD') : null, category: vals.category, amount: vals.amount, note: vals.note };
      if (editing && editing.id) await api.updateExpense(editing.id, payload); else await api.createExpense(payload);
      message.success('Saved');
      if (stay) { form.resetFields(); form.setFieldsValue({date: dayjs()}); } else { load(); }
    }catch(e){ message.error('Save failed'); } finally { setSaving(false); }
  };

  const columns = [
    { title:'Date', dataIndex:'date', render:d=> d ? dayjs(d).format('DD-MM-YYYY') : '-' },
    { title:'Category', dataIndex:'category' },
    { title:'Amount', dataIndex:'amount', render:a=>currencyINR(a) },
    { title:'Note', dataIndex:'note' },
  ];

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2>Expenses</h2><Button onClick={()=>openAdd()}>+ Add</Button></div>
        <Card style={{marginTop:12}}>
          <Table dataSource={rows} columns={columns} rowKey={r=>r.id} />
        </Card>

        <Modal title={editing ? 'Edit Expense' : 'Add Expense'} open={false} onCancel={()=>{}} footer={null}>
          <Form form={form} layout="vertical">
            <Form.Item name="date" label="Date"><DatePicker format="DD-MM-YYYY" defaultValue={dayjs()} /></Form.Item>
            <Form.Item name="category" label="Category" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{required:true}]}><InputNumber min={0} step={0.01} /></Form.Item>
            <Form.Item name="note" label="Note"><Input.TextArea rows={3} /></Form.Item>
            <div style={{textAlign:'center', marginTop:12}}>
              <Button type="primary" onClick={()=>handleSave(false)}>Save & Exit</Button>
              <Button style={{marginLeft:8}} onClick={()=>handleSave(true)}>Save & New</Button>
            </div>
          </Form>
        </Modal>

      </div>
    </AppLayout>
  );
}
