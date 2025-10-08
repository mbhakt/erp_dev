// src/pages/PurchaseBillsPage.jsx
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
  Row,
  Col,
  message,
  Spin,
} from "antd";
import {
  fetchPurchases,
  fetchPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  fetchParties,
  fetchItems,
} from "../api";
import dayjs from "dayjs";
import { currencyINR } from "../utils/format";
import AppLayout from "../components/AppLayout";
const { TextArea } = Input;

const emptyForm = {
  party_id: null,
  bill_no: "",
  date: dayjs().format("YYYY-MM-DD"),
  notes: "",
  items: [],
  sub_total: 0,
  tax_total: 0,
  grand_total: 0,
};

export default function PurchaseBillsPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [parties, setParties] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  async function loadList() {
    setLoading(true);
    try {
      const resp = await fetchPurchases({ limit: 500 });
      // resp format: { data: [...], total }
      const data = resp.data || resp;
      setRows(data);
      setTotal(resp.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMasters() {
    try {
      const p = await fetchParties({ limit: 500 });
      setParties(p.data || p);
    } catch (e) {
      console.warn("Failed to load parties", e);
    }
    try {
      const it = await fetchItems({ limit: 500 });
      setItemsMaster(it.data || it);
    } catch (e) {
      console.warn("Failed to load items", e);
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
      ...emptyForm,
      date: dayjs(),
      items: [{ description: "", qty: 1, rate: 0, amount: 0 }],
    });
    setModalOpen(true);
  }

  async function openEdit(id) {
    setEditingId(id);
    setModalOpen(true);
    form.resetFields();
    try {
      const resp = await fetchPurchase(id);
      const p = resp.data || resp;
      form.setFieldsValue({
        party_id: p.party_id || null,
        bill_no: p.bill_no || "",
        date: p.date ? dayjs(p.date) : dayjs(),
        notes: p.notes || "",
        items:
          (p.items && p.items.map((it) => ({
            id: it.id,
            item_id: it.item_id,
            description: it.description || "",
            qty: Number(it.qty) || 0,
            rate: Number(it.rate) || 0,
            amount: Number(it.amount) || 0,
            tax: Number(it.tax) || 0,
          }))) || [],
      });
      calcTotals();
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase.");
      setModalOpen(false);
    }
  }

  function computeLineAmount(line) {
    const qty = Number(line.qty) || 0;
    const rate = Number(line.rate) || 0;
    return Math.round((qty * rate) * 100) / 100;
  }

  function calcTotals() {
    const values = form.getFieldsValue();
    const items = values.items || [];
    let sub = 0;
    let tax = 0;
    items.forEach((it) => {
      const amt = computeLineAmount(it);
      sub += amt;
      tax += Number(it.tax || 0);
    });
    sub = Math.round(sub * 100) / 100;
    tax = Math.round(tax * 100) / 100;
    const grand = Math.round((sub + tax) * 100) / 100;
    form.setFieldsValue({ sub_total: sub, tax_total: tax, grand_total: grand });
    return { sub, tax, grand };
  }

  // Keep amounts updated on field change
  function onValuesChange() {
    const vals = form.getFieldsValue();
    const items = (vals.items || []).map((it) => {
      const amount = computeLineAmount(it);
      return { ...it, amount };
    });
    form.setFieldsValue({ items });
    calcTotals();
  }

  async function doSave(closeAfter = true) {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        party_id: values.party_id || null,
        bill_no: values.bill_no || "",
        date: values.date ? values.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        notes: values.notes || "",
        items: (values.items || []).map((it) => ({
          item_id: it.item_id || null,
          description: it.description || "",
          qty: Number(it.qty) || 0,
          rate: Number(it.rate) || 0,
          amount: Number(it.amount) || 0,
          tax: Number(it.tax) || 0,
        })),
        sub_total: Number(values.sub_total || 0),
        tax_total: Number(values.tax_total || 0),
        grand_total: Number(values.grand_total || 0),
      };

      if (editingId) {
        await updatePurchase(editingId, payload);
        message.success("Purchase updated");
      } else {
        const r = await createPurchase(payload);
        message.success("Purchase created");
        // if created, editingId may be r.id
      }

      await loadList();

      if (closeAfter) {
        setModalOpen(false);
      } else {
        // Save & New -> reset form for a new entry
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({
          ...emptyForm,
          date: dayjs(),
          items: [{ description: "", qty: 1, rate: 0, amount: 0 }],
        });
      }
    } catch (err) {
      console.error(err);
      if (err.error || err.response) {
        message.error("Failed to save. See console.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id) {
    try {
      await deletePurchase(id);
      message.success("Deleted");
      loadList();
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  }

  const columns = [
    { title: "Bill No", dataIndex: "bill_no", key: "bill_no" },
    {
      title: "Vendor",
      dataIndex: "party_id",
      key: "party_id",
      render: (v) => {
        const p = parties.find((x) => x.id === v);
        return p ? p.name : "-";
      },
    },
    {
      title: "Bill Date",
      dataIndex: "date",
      key: "date",
      render: (d) => (d ? dayjs(d).format("DD-MM-YYYY") : ""),
    },
    {
      title: "Total",
      dataIndex: "grand_total",
      key: "grand_total",
      align: "right",
      render: (v) => currencyINR(Number(v || 0)),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row.id)}>Edit</Button>
          <Popconfirm title="Delete this bill?" onConfirm={() => doDelete(row.id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <Card title="Purchase Bills" extra={<Button type="primary" onClick={openNew}>+ Add Purchase</Button>}>
        <Spin spinning={loading}>
          <Table dataSource={rows} columns={columns} rowKey="id" pagination={{ pageSize: 50 }} />
        </Spin>
      </Card>

      <Modal
        title={editingId ? `Edit Purchase #${editingId}` : "New Purchase"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={900}
        footer={[
          <Button key="back" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>,
          <Button key="saveNew" type="default" onClick={() => doSave(false)} loading={saving}>Save & New</Button>,
          <Button key="save" type="primary" onClick={() => doSave(true)} loading={saving}>Save</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Party" name="party_id">
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select party"
                  allowClear
                >
                  {(parties || []).map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Bill No" name="bill_no">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Date" name="date">
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Card size="small" title="Line Items" style={{ marginBottom: 12 }}>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, idx) => (
                    <Row key={field.key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={8}>
                        <Form.Item {...field} name={[field.name, "description"]} fieldKey={[field.fieldKey, "description"]} rules={[{ required: true, message: "Required" }]}>
                          <Select showSearch placeholder="Item / Description" onSelect={(val) => {
                            const item = itemsMaster.find((i) => i.id === val);
                            if (item) {
                              const cur = form.getFieldValue("items") || [];
                              cur[idx] = { ...cur[idx], description: item.name, rate: item.purchase_rate || 0 };
                              form.setFieldsValue({ items: cur });
                              calcTotals();
                            }
                          }}>
                            {(itemsMaster || []).map((it) => <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>)}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item {...field} name={[field.name, "qty"]} fieldKey={[field.fieldKey, "qty"]} rules={[{ required: true }]}>
                          <InputNumber style={{ width: "100%" }} min={0} precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item {...field} name={[field.name, "rate"]} fieldKey={[field.fieldKey, "rate"]} rules={[{ required: true }]}>
                          <InputNumber style={{ width: "100%" }} min={0} precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item shouldUpdate={(prev, cur) => true}>
                          {() => {
                            const items = form.getFieldValue("items") || [];
                            const it = items[idx] || {};
                            const amt = computeLineAmount(it);
                            return <div style={{ padding: 6 }}>{currencyINR(amt)}</div>;
                          }}
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item {...field} name={[field.name, "tax"]} fieldKey={[field.fieldKey, "tax"]}>
                          <InputNumber placeholder="Tax" style={{ width: "100%" }} min={0} precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Button danger onClick={() => { remove(field.name); calcTotals(); }}>Del</Button>
                      </Col>
                    </Row>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => { add({ description: "", qty: 1, rate: 0, amount: 0 }); }}>
                      + Add line
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Sub total" name="sub_total">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Tax total" name="tax_total">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Grand total" name="grand_total">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </AppLayout>
  );
}
