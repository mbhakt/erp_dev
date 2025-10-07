// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceEditor from "./pages/InvoiceEditor";
import PartiesPage from "./pages/PartiesPage";
import ItemsPage from "./pages/ItemsPage";
import Dashboard from "./pages/Dashboard";

import { ModalProvider } from "./contexts/ModalContext";
import ModalHost from "./components/ModalHost";

import SalesModule from "./pages/SalesModule";
import SaleInvoices from "./pages/SaleInvoices";
import EstimatePage from "./pages/EstimatePage";
import ProformaInvoicePage from "./pages/ProformaInvoicePage";
import SaleOrderPage from "./pages/SaleOrderPage";
import DeliveryChallanPage from "./pages/DeliveryChallanPage";
import CreditNotePage from "./pages/CreditNotePage";
import ExpensesPage from "./pages/ExpensesPage";
import PurchaseOrderPage from "./pages/PurchaseOrderPage";
import PurchaseNotePage from "./pages/PurchaseNotePage";

import BankAccountsPage from "./pages/BankAccountsPage";
import CashInHandPage from "./pages/CashInHandPage";
import ChequesPage from "./pages/ChequesPage";
import LoanAccountsPage from "./pages/LoanAccountsPage";

import ReportsHomePage from "./pages/ReportsHomePage";
import TransactionReports from "./pages/TransactionReports";
import PartyReports from "./pages/PartyReports";
import GstReports from "./pages/GstReports";
import StockReports from "./pages/StockReports";

import ImportItemsPage from "./pages/ImportItemsPage";
import ImportTallyPage from "./pages/ImportTallyPage";
import ImportPartiesPage from "./pages/ImportPartiesPage";
import ExportTallyPage from "./pages/ExportTallyPage";
import ExportItemsPage from "./pages/ExportItemsPage";

import SettingsGeneralPage from "./pages/SettingsGeneralPage";
import SettingsTransactionPage from "./pages/SettingsTransactionPage";
import SettingsPrintPage from "./pages/SettingsPrintPage";
import SettingsTaxesPage from "./pages/SettingsTaxesPage";
import SettingsMessagesPage from "./pages/SettingsMessagesPage";
import SettingsPartyPage from "./pages/SettingsPartyPage";
import SettingsItemPage from "./pages/SettingsItemPage";
import SettingsServicePage from "./pages/SettingsServicePage";
import SettingsAccountingPage from "./pages/SettingsAccountingPage";
import SettingsCompanyPage from "./pages/SettingsCompanyPage";
import HomePage from "./pages/HomePage";
import PurchaseBillsPage from "./pages/PurchaseBillsPage";
import PaymentOutPage from "./pages/PaymentOutPage";
import PurchaseReturnPage from "./pages/PurchaseReturnPage";
import PurchasesPage from "./pages/PurchasesPage";

import RecalculatePage from "./pages/RecalculatePage";
import DataCleanupPage from "./pages/DataCleanupPage";
import SyncSharePage from "./pages/SyncSharePage";
import AutoBackupPage from "./pages/AutoBackupPage";
import BackupComputerPage from "./pages/BackupComputerPage";
import BackupDrivePage from "./pages/BackupDrivePage";
import RestoreBackupPage from "./pages/RestoreBackupPage";
import SettingsUsersPage from "./pages/SettingsUsersPage";
import BackupPage from "./pages/BackupPage";
import RestorePage from "./pages/RestorePage";
import ImportExportPage from "./pages/ImportExportPage";

function NotFound() {
  return <div style={{ padding: 24 }}>Page not found</div>;
}

export default function App() {
  return (
    <ModalProvider>
      {/* Use existing AppLayout (it accepts children) so Sidebar + Topbar always present */}
      {/* <AppLayout> */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sales" element={<SalesModule />} />
          <Route path="/sale" element={<Navigate to="/sale/invoices" replace />} />
          <Route path='/sale/invoices' element={<SaleInvoices/>}/>
          <Route path="/sale/estimates" element={<EstimatePage />} />
          <Route path="/sale/proforma" element={<ProformaInvoicePage />} />
          <Route path="/sale/orders" element={<SaleOrderPage />} />
          <Route path="/sale/delivery" element={<DeliveryChallanPage />} />
          <Route path="/sale/returns" element={<CreditNotePage />} />
          <Route path='/sale/new' element={<InvoiceEditor/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
          

          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/parties" element={<PartiesPage />} />
          <Route path="/items" element={<ItemsPage />} />

          <Route path="/purchase/bills" element={<PurchaseBillsPage />} />
          <Route path="/purchase/payment-out" element={<PaymentOutPage />} />
        <Route path="/purchase/expenses" element={<ExpensesPage />} />
        <Route path="/purchase/orders" element={<PurchaseOrderPage />} />
        <Route path="/purchase/notes" element={<PurchaseNotePage />} />

        <Route path="/cash/banks" element={<BankAccountsPage />} />
        <Route path="/cash/hand" element={<CashInHandPage />} />
        <Route path="/cash/cheques" element={<ChequesPage />} />
        <Route path="/cash/loans" element={<LoanAccountsPage />} />

        <Route path="/reports" element={<ReportsHomePage />} />
        <Route path="/reports/transactions" element={<TransactionReports />} />
        <Route path="/reports/party" element={<PartyReports />} />
        <Route path="/reports/gst" element={<GstReports />} />
        <Route path="/reports/stock" element={<StockReports />} />

        <Route path="/sync" element={<SyncSharePage />} />
        <Route path="/sync/share" element={<SyncSharePage />} />
        <Route path="/sync/autobackup" element={<AutoBackupPage />} />
        <Route path="/sync/backup/computer" element={<BackupComputerPage />} />
        <Route path="/sync/backup/drive" element={<BackupDrivePage />} />
        <Route path="/sync/restore" element={<RestoreBackupPage />} />


        <Route path="/utils/import/items" element={<ImportItemsPage />} />
        <Route path="/utils/import/tally" element={<ImportTallyPage />} />
        <Route path="/utils/import/parties" element={<ImportPartiesPage />} />
        <Route path="/utils/export/tally" element={<ExportTallyPage />} />
        <Route path="/utils/export/items" element={<ExportItemsPage />} />
        <Route path="/utils/recalculate" element={<RecalculatePage/>} />
        <Route path="/utils/cleanup" element={<DataCleanupPage/>} />

        <Route path="/settings/general" element={<SettingsGeneralPage />} />
        <Route path="/settings/transaction" element={<SettingsTransactionPage />} />
        <Route path="/settings/print" element={<SettingsPrintPage />} />
        <Route path="/settings/taxes" element={<SettingsTaxesPage />} />
        <Route path="/settings/messages" element={<SettingsMessagesPage />} />
        <Route path="/settings/party" element={<SettingsPartyPage />} />
        <Route path="/settings/item" element={<SettingsItemPage />} />
        <Route path="/settings/service-reminders" element={<SettingsServicePage />} />
        <Route path="/settings/accounting" element={<SettingsAccountingPage />} />
        <Route path="/settings/company" element={<SettingsCompanyPage/>} />
        <Route path="/settings/users" element={<SettingsUsersPage/>} />

        <Route path="/sync" element={<SyncSharePage/>} />
        <Route path="/backup" element={<BackupPage/>} />
        <Route path="/restore" element={<RestorePage/>} />
        <Route path="/import" element={<ImportExportPage/>} />

        

          {/* Add other app routes under AppLayout here */}
        </Routes>
      {/* </AppLayout> */}

      {/* Global modal renderer */}
      <ModalHost />
    </ModalProvider>
  );
}
