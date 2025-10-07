import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Upload, Button, message, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import UtilityCard from '../components/UtilityCard';

export default function ImportExportPage(){
  const [preview, setPreview] = useState([]);

  const props = {
    beforeUpload: file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(0,50).map((r,i)=>({key:i, raw:r}));
        setPreview(rows);
        message.success('File loaded (preview)');
      };
      reader.readAsText(file);
      return false;
    },
    multiple: false,
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Import / Export</h2>
        <UtilityCard title="Import CSV / Excel" description="Upload CSV to preview and later validate/import into the system.">
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </UtilityCard>

        <UtilityCard title="Preview" description="Shows first 50 lines (mock preview).">
          <Table dataSource={preview} columns={[{title:'Raw',dataIndex:'raw'}]} rowKey="key" pagination={false} />
        </UtilityCard>
      </div>
    </AppLayout>
  );
}
