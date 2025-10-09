// src/pages/BackupRestorePage.jsx
import React, { useState } from "react";
import { Card, Button, Upload, Progress, message } from "antd";
import api from "../api";

export default function BackupRestorePage({ restoreMode }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBackup = async () => {
    setBusy(true);
    setProgress(10);
    try {
      const res = await api.createBackup();
      setProgress(90);
      if (res.success) {
        message.success(`Backup created: ${res.backupFile}`);
      } else {
        message.error("Backup failed");
      }
    } catch (err) {
      message.error("Backup error");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleRestore = async ({ file }) => {
    setBusy(true);
    setProgress(20);
    try {
      // read file if needed. We'll mock call
      const res = await api.restoreBackup(file);
      setProgress(100);
      if (res.success) {
        message.success("Restore succeeded");
      } else {
        message.error(res.error || "Restore failed");
      }
    } catch (err) {
      message.error("Restore error");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <h2>{restoreMode ? "Restore Backup" : "Create Backup"}</h2>
      <Card>
        {restoreMode ? (
          <>
            <Upload beforeUpload={(file) => { handleRestore({ file }); return false; }} showUploadList={false}>
              <Button type="primary" disabled={busy}>Select Backup File & Restore</Button>
            </Upload>
            {busy && <Progress percent={progress} />}
          </>
        ) : (
          <>
            <Button type="primary" onClick={handleBackup} disabled={busy}>Create Backup</Button>
            {busy && <Progress percent={progress} />}
          </>
        )}
      </Card>
    </div>
  );
}