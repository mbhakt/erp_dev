// Mock file operations used by Backup/Restore pages
export async function createMockBackup() {
  // simulate network / disk op delay
  await new Promise(r=>setTimeout(r, 700));
  const name = `backup_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.zip`;
  return { success: true, filename: name, size_kb: Math.floor(Math.random()*900)+100 };
}
export async function restoreMockBackup(file) {
  await new Promise(r=>setTimeout(r, 1000));
  return { success: true, restored_records: Math.floor(Math.random()*500)+10 };
}