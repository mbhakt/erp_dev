import React from 'react';
import AppLayout from '../components/AppLayout';
import { Button, Modal, message } from 'antd';
import UtilityCard from '../components/UtilityCard';

export default function DataCleanupPage(){
  const runCleanup = () => {
    Modal.confirm({
      title: 'Run Data Cleanup',
      content: 'This will remove orphaned records and suggest duplicates to delete (mock). Continue?',
      onOk: () => {
        message.success('Cleanup completed (mock) - 12 items removed');
      }
    });
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <h2>Data Cleanup</h2>
        <UtilityCard title="Cleanup" description="Identify duplicates and orphaned records.">
          <Button danger onClick={runCleanup}>Run Cleanup</Button>
        </UtilityCard>
      </div>
    </AppLayout>
  );
}
