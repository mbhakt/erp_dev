// src/components/PurchaseModal.jsx
import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, InputNumber } from "antd";

/**
 * Props:
 * - open: boolean
 * - purchase: object | null  (for edit)
 * - onClose: () => void
 * - onSave: (formData) => Promise|void
 * - saving: boolean
 */
export default function PurchaseModal({ open, purchase, onClose, onSave, saving }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (purchase) {
      form.setFieldsValue({
        bill_no: purchase.billNo ?? purchase.bill_no ?? purchase.invoice_no ?? purchase.id,
        vendor: purchase.vendorName ?? purchase.vendor_name ?? purchase.party_name ?? "",
        bill_date: purchase.billDate ? (new Date(purchase.billDate)) : null,
        total: Number(purchase.total ?? purchase.grand_total ?? purchase.amount ?? 0),
        notes: purchase.notes ?? purchase.note ?? ""
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ total: 0 });
    }
  }, [purchase, form]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      const payload = {
        bill_no: vals.bill_no,
        vendor: vals.vendor,
        bill_date: vals.bill_date ? vals.bill_date.toISOString().slice(0,10) : null,
        total: Number(vals.total || 0),
        notes: vals.notes || ""
      };
      await onSave(payload);
    } catch (err) {
      // validation error
    }
  };

  return (
    <Modal
      title={purchase ? "Edit Purchase" : "Add Purchase"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={saving}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="bill_no" label="Bill No" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="vendor" label="Vendor / Party" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="bill_date" label="Bill Date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="total" label="Total">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}