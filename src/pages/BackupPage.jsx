import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Button, message, List } from 'antd';
import UtilityCard from '../components/UtilityCard';
import { createMockBackup } from '../utils/mockFileOps';

export default function BackupPage(){
  const [backups, setBackups] = useState([]);

  const doBackup = async () => {
    try {
      const res = await createMockBackup();
      if (res.success) {
        setBackups(prev=>[{name:res.filename, size_kb:res.size_kb, created_at: new Date().toISOString()}, ...prev]);
        message.success('Backup created: ' + res.filename);
      } else message.error('Backup failed');
    } catch(e){ message.error('Backup error'); }
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Backup</h2>
        <UtilityCard title="Create Backup" description="Creates a mock backup file (ZIP) and lists it below.">
          <Button type="primary" onClick={doBackup}>Backup Now</Button>
        </UtilityCard>

        <UtilityCard title="Available Backups" description="Mock backups stored locally (list).">
          <List dataSource={backups} renderItem={b=>(
            <List.Item>
              <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                <div>
                  <div style={{fontWeight:700}}>{b.name}</div>
                  <div style={{fontSize:12,color:'#666'}}>Size: {b.size_kb} KB • Created: {new Date(b.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <Button onClick={()=>message.info('Download (mock)')}>Download</Button>
                </div>
              </div>
            </List.Item>
          )} />
        </UtilityCard>
      </div>
    </AppLayout>
  );
}
