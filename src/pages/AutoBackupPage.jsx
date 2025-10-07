import React from "react";
import AppLayout from "../components/AppLayout";
import { Card, Switch, Select, Button } from "antd";

export default function AutoBackupPage(){
  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Auto Backup</h1>
          <div>
        <Card>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <div>Enable Auto Backup</div>
            <Switch defaultChecked />
            <div style={{marginLeft:20}}>Schedule</div>
            <Select defaultValue="daily" style={{width:160}}><Select.Option value="daily">Daily</Select.Option><Select.Option value="weekly">Weekly</Select.Option></Select>
            <Button type="primary" style={{marginLeft:12}}>Save</Button>
          </div>
        </Card>
      </div>
        </div>
        <Card>
          <div className="text-sm text-gray-600">Configure your automatic backup preferences here. You can enable or disable auto backups and set the schedule to daily or weekly. Make sure to save your settings after making changes.</div>
        </Card>
      </div>
    </AppLayout>
  );
}