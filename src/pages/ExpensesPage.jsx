// src/pages/ExpensesPage.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Popconfirm,
  Space,
  message,
  Row,
  Col,
  Spin,
} from "antd";
import { fetchExpenses, createExpense, updateExpense, deleteExpense, fetchParties } from '../api';
import dayjs from "dayjs";
import { currencyINR } from "../utils/format";
import AppLayout from "../components/AppLayout";

const { TextArea } = Input;

const defaultExpense = {
  voucher_no: "",
  date: dayjs().format("YYYY-MM-DD"),
  category: "",
  payee: "",
  payment_type: "Cash",
  amount: 0,
  notes: "",
};

export default function ExpensesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  async function loadList() {
    setLoading(true);
    try {
      const resp = await fetchExpenses({ limit: 500 });
      const data = resp.data || resp;
      setRows(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMasters() {
    try {
      const p = await fetchParties({ limit: 500 });
      setParties(p.data || p);
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    loadList();
    loadMasters();
  }, []);

  function openNew() {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      ...defaultExpense,
      date: dayjs(),
    });
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    form.setFieldsValue({
      voucher_no: row.voucher_no,
      date: row.date ? dayjs(row.date) : dayjs(),
      category: row.category,
      payee: row.payee,
      payment_type: row.payment_type,
      amount: Number(row.amount || 0),
      notes: row.notes,
    });
    setModalOpen(true);
  }

  async function doSave(closeAfter = true) {
    try {
      const vals = await form.validateFields();
      setSaving(true);
      const payload = {
        voucher_no: vals.voucher_no || "",
        date: vals.date ? vals.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        category: vals.category || "",
        payee: vals.payee || "",
        payment_type: vals.payment_type || "Cash",
        amount: Number(vals.amount || 0),
        notes: vals.notes || "",
      };
      if (editingId) {
        await updateExpense(editingId, payload);
        message.success("Expense updated");
      } else {
        await createExpense(payload);
        message.success("Expense created");
      }
      await loadList();
      if (closeAfter) setModalOpen(false);
      else {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ ...defaultExpense, date: dayjs() });
      }
    } catch (err) {
      console.error(err);
      message.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id) {
    try {
      await deleteExpense(id);
      message.success("Deleted");
      loadList();
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  }

  const columns = [
    { title: "Voucher", dataIndex: "voucher_no", key: "voucher_no" },
    { title: "Date", dataIndex: "date", key: "date", render: (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "") },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Payee", dataIndex: "payee", key: "payee" },
    { title: "Amount", dataIndex: "amount", key: "amount", align: "right", render: (v) => currencyINR(Number(v || 0)) },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          <Popconfirm title="Delete?" onConfirm={() => doDelete(row.id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <Card title="Expenses" extra={<Button type="primary" onClick={openNew}>+ Add Expense</Button>}>
        <Spin spinning={loading}>
          <Table dataSource={rows} columns={columns} rowKey="id" pagination={{ pageSize: 50 }} />
        </Spin>
      </Card>

      <Modal
        title={editingId ? `Edit Expense #${editingId}` : "New Expense"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={700}
        footer={[
          <Button key="back" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>,
          <Button key="saveNew" onClick={() => doSave(false)} disabled={saving}>Save & New</Button>,
          <Button key="save" type="primary" onClick={() => doSave(true)} loading={saving}>Save</Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="voucher_no" label="Voucher No">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="date" label="Date">
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payment_type" label="Payment Type">
                <Select>
                  <Select.Option value="Cash">Cash</Select.Option>
                  <Select.Option value="Bank">Bank</Select.Option>
                  <Select.Option value="Card">Card</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="category" label="Category">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payee" label="Payee">
                <Select showSearch optionFilterProp="children" allowClear>
                  {(parties || []).map((p) => <Select.Option key={p.id} value={p.name}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="amount" label="Amount">
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}