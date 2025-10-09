import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Card, Button, Switch, List, message } from 'antd';
import UtilityCard from '../components/UtilityCard';

export default function SyncSharePage(){
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleSync = async () => {
    setSyncing(true);
    setLogs(prev=>[`Started sync at ${new Date().toLocaleString()}`, ...prev]);
    // mock steps
    await new Promise(r=>setTimeout(r,800));
    setLogs(prev=>[`Synced Parties (${Math.floor(Math.random()*50)})`, ...prev]);
    await new Promise(r=>setTimeout(r,600));
    setLogs(prev=>[`Synced Items (${Math.floor(Math.random()*120)})`, ...prev]);
    await new Promise(r=>setTimeout(r,500));
    setLogs(prev=>[`Sync complete at ${new Date().toLocaleString()}`, ...prev]);
    message.success('Sync completed (mock)');
    setSyncing(false);
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Sync, Share & Backup</h2>
        <UtilityCard title="Cloud Sync" description="Toggle to enable mock cloud sync (no real cloud yet).">
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <Switch defaultChecked />
            <Button onClick={handleSync} loading={syncing}>Sync Now</Button>
          </div>
        </UtilityCard>

        <UtilityCard title="Share Data" description="Share selected reports or period via mock email (preview only).">
          <Button onClick={()=>message.info('Sharing (mock) - email sent')}>Share Selected</Button>
        </UtilityCard>

        <Card title="Sync Logs">
          <List dataSource={logs} renderItem={item=> <List.Item>{item}</List.Item>} />
        </Card>
      </div>
    </AppLayout>
  );
}