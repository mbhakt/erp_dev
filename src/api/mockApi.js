// Simple mock API: returns promises (simulate network)
const delay = (ms=300)=>new Promise(r=>setTimeout(r,ms));

export const fetchDashboard = async ()=> {
  await delay();
  return { totalReceivable:700, totalPayable:0, totalSale:1000 };
};

export const fetchParties = async ()=> {
  await delay();
  return [
    { id:1,name:'Madhav Bhakta',phone:'9037248247',email:'mbhakt@gmail.com', balance:2555 },
    { id:2,name:'Madhu',phone:'7012422257',email:'', balance:0 },
    { id:3,name:'Prakash Printers',phone:'7686878989',email:'', balance:0 }
  ];
};
export const fetchPartyTransactions = async (id)=> {
  await delay();
  return [
    { id:101, date:'2025-10-02', invoice_no:'006', party_name:'Madhav Bhakta', amount:610 },
    { id:100, date:'2025-10-02', invoice_no:'005', party_name:'Madhav Bhakta', amount:400 }
  ];
};

export const fetchItems = async ()=> {
  await delay();
  return [
    { id:'ACW001', name:'A4 Copier White', sale_price:210, purchase_price:0, stock:0 },
    { id:'ITM001', name:'A4 JK Bond', sale_price:325, purchase_price:0, stock:0 },
    { id:'ITM003', name:'Ledger Paper', sale_price:300, purchase_price:0, stock:0 }
  ];
};

export const fetchInvoices = async ()=> {
  await delay();
  return [
    { id:6, invoice_no:'006', date:'2025-10-02', party_name:'Madhav Bhakta', total:610 },
    { id:5, invoice_no:'005', date:'2025-10-02', party_name:'Madhav Bhakta', total:400 },
    { id:4, invoice_no:'004', date:'2025-09-27', party_name:'Sirigannada Printers', total:800 }
  ];
};

export const fetchPurchases = async ()=> {
  await delay();
  return [
    { id:3, bill_no:'3', vendor:'-', bill_date:'2025-10-03', total:24640 },
    { id:2, bill_no:'2', vendor:'Madhav Bhakta', bill_date:'2025-09-26', total:235.2 }
  ];
};

export const fetchBanks = async ()=> {
  await delay();
  return [
    { id:1, name:'Axis Bank', account:'1234567890', balance:50000 },
    { id:2, name:'HDFC', account:'9876543210', balance:120000 }
  ];
};

export const fetchReports = async ()=> {
  await delay();
  return { sales:[{name:'Week1', value:200},{name:'Week2', value:450},{name:'Week3', value:600}] };
};

export default { };