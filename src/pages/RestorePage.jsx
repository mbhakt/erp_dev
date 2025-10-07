import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import UtilityCard from '../components/UtilityCard';
import { restoreMockBackup } from '../utils/mockFileOps';

export default function RestorePage(){
  const [fileList, setFileList] = useState([]);

  const props = {
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const doRestore = async () => {
    if (!fileList.length) { message.error('Select a file first'); return; }
    const res = await restoreMockBackup(fileList[0]);
    if (res.success) message.success(`Restore completed: ${res.restored_records} records restored (mock)`);
    else message.error('Restore failed');
    setFileList([]);
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Restore</h2>
        <UtilityCard title="Restore from Backup" description="Upload a backup ZIP to restore (mock).">
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Select Backup File</Button>
          </Upload>
          <div style={{marginTop:12}}>
            <Button onClick={doRestore} type="primary">Restore Now</Button>
          </div>
        </UtilityCard>
      </div>
    </AppLayout>
  );
}
