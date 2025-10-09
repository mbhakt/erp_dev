import React from 'react';
import { Button, Space } from 'antd';

export default function BottomButtonBar({ onSaveExit, onSaveNew, onDelete, onClear, onExit, loading, disableDelete }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #eee', marginTop: 16, background: '#fafafa', position: 'sticky', bottom: 0, zIndex: 10 }}>
      <Space>
        <Button type="primary" onClick={onSaveExit} loading={loading}>💾 Save & Exit</Button>
        <Button onClick={onSaveNew} loading={loading}>➕ Save & New</Button>
        <Button danger onClick={onDelete} disabled={disableDelete}>❌ Delete</Button>
        <Button onClick={onClear}>🧹 Clear</Button>
        <Button onClick={onExit}>🚪 Exit</Button>
      </Space>
    </div>
  );
}