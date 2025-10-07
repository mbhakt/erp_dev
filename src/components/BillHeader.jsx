import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

/**
 * BillHeader
 * - uses provided `form` if it's a proper AntD form instance, otherwise creates a local internal form
 * - sets default date to today when not present
 * - calls onValuesChange(allValues) when header fields change
 */
export default function BillHeader({ form, parties = [], onValuesChange }) {
  const [localForm] = Form.useForm();
  const usedForm = form && typeof form === 'object' && typeof form.getFieldValue === 'function' ? form : localForm;

  useEffect(() => {
    if (usedForm) {
      const d = usedForm.getFieldValue('bill_date');
      if (!d) usedForm.setFieldsValue({ bill_date: dayjs() });
    }
  }, [usedForm]);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <Form
        form={usedForm}
        layout="inline"
        style={{ width: '100%' }}
        onValuesChange={(changed, all) => onValuesChange && onValuesChange(all)}
      >
        <Form.Item name="party_id" label="Party" rules={[{ required: true }]}>
          <Select style={{ width: 240 }} showSearch placeholder="Select party">
            {parties.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="bill_no" label="Bill No" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="bill_date" label="Date">
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item name="payment_mode" label="Payment">
          <Select defaultValue="Cash" style={{ width: 140 }}>
            <Select.Option value="Cash">Cash</Select.Option>
            <Select.Option value="Bank">Bank</Select.Option>
            <Select.Option value="Credit">Credit</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
}
