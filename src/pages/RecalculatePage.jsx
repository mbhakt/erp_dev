import React, {useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Button, Progress, message } from 'antd';
import UtilityCard from '../components/UtilityCard';

export default function RecalculatePage(){
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const start = async () => {
    setRunning(true);
    setProgress(10);
    for(let i=1;i<=9;i++){
      await new Promise(r=>setTimeout(r, 300));
      setProgress(p=>p+Math.floor(Math.random()*9)+5);
    }
    setProgress(100);
    message.success('Recalculation completed (mock)');
    setRunning(false);
    setTimeout(()=>setProgress(0), 1500);
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Recalculate Balances</h2>
        <UtilityCard title="Recompute balances & stock" description="Recalculate party balances, item stock and aggregated fields.">
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <Button type="primary" onClick={start} loading={running}>Start Recalculate</Button>
            <div style={{width:240}}><Progress percent={progress} /></div>
          </div>
        </UtilityCard>
      </div>
    </AppLayout>
  );
}