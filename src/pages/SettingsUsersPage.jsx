import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import UtilityCard from '../components/UtilityCard';

export default function SettingsUsersPage(){
  const [users, setUsers] = useState([{id:1,name:'Admin',role:'Admin'},{id:2,name:'Clerk',role:'User'}]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (u) => { setEditing(u); form.setFieldsValue(u); setOpen(true); };

  const save = async () => {
    const vals = await form.validateFields();
    if (editing) setUsers(prev=>prev.map(p=>p.id===editing.id?{...p,...vals}:p));
    else setUsers(prev=>[{id:Date.now(),...vals}, ...prev]);
    setOpen(false);
    message.success('Saved (mock)');
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>User Management</h2>
        <UtilityCard title="Users" description="Add or edit users and roles.">
          <Button type="primary" onClick={openAdd}>+ Add User</Button>
        </UtilityCard>

        <Table dataSource={users} columns={[
          {title:'Name',dataIndex:'name'},
          {title:'Role',dataIndex:'role'},
          {title:'Action',render:(_,r)=> <Button onClick={()=>openEdit(r)}>Edit</Button>}
        ]} rowKey={r=>r.id} />

        <Modal title={editing ? 'Edit User' : 'Add User'} open={open} onCancel={()=>setOpen(false)} onOk={save}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="role" label="Role" rules={[{required:true}]}>
              <Select options={[{label:'Admin',value:'Admin'},{label:'User',value:'User'}]} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}