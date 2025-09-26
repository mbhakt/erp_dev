// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceForm from "./components/InvoiceForm";
import PartiesPage from "./pages/PartiesPage";
import ItemsPage from "./pages/ItemsPage";

import { ModalProvider } from "./contexts/ModalContext";
import ModalHost from "./components/ModalHost";

import SalesModule from "./pages/SalesModule";
import SaleInvoicesPage from "./pages/SaleInvoicesPage";
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

import ReportsPage from "./pages/ReportsPage";

import SyncSharePage from "./pages/SyncSharePage";
import AutoBackupPage from "./pages/AutoBackupPage";
import BackupComputerPage from "./pages/BackupComputerPage";
import BackupDrivePage from "./pages/BackupDrivePage";
import RestoreBackupPage from "./pages/RestoreBackupPage";

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
import HomePage from "./pages/HomePage";
import PurchaseBillsPage from "./pages/PurchaseBillsPage";
import PaymentOutPage from "./pages/PaymentOutPage";
import PurchaseReturnPage from "./pages/PurchaseReturnPage";
import PurchasesPage from "./pages/PurchasesPage";


export default function App() {
  return (
    <ModalProvider>
      {/* Use existing AppLayout (it accepts children) so Sidebar + Topbar always present */}
      {/* <AppLayout> */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sales" element={<SalesModule />} />
          <Route path="/sale" element={<Navigate to="/sale/invoices" replace />} />
          <Route path="/sale/invoices" element={<SaleInvoicesPage />} />
          <Route path="/sale/estimates" element={<EstimatePage />} />
          <Route path="/sale/proforma" element={<ProformaInvoicePage />} />
          <Route path="/sale/orders" element={<SaleOrderPage />} />
          <Route path="/sale/delivery" element={<DeliveryChallanPage />} />
          <Route path="/sale/returns" element={<CreditNotePage />} />
          <Route path="/sale/new" element={<InvoiceForm />} />

          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/parties" element={<PartiesPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/sales" element={<SalesModule />} />

          <Route path="/purchase/bills" element={<PurchaseBillsPage />} />
          <Route path="/purchase/payment-out" element={<PaymentOutPage />} />
        <Route path="/purchase/expenses" element={<ExpensesPage />} />
        <Route path="/purchase/orders" element={<PurchaseOrderPage />} />
        <Route path="/purchase/notes" element={<PurchaseNotePage />} />

        <Route path="/cash/banks" element={<BankAccountsPage />} />
        <Route path="/cash/hand" element={<CashInHandPage />} />
        <Route path="/cash/cheques" element={<ChequesPage />} />
        <Route path="/cash/loans" element={<LoanAccountsPage />} />

        <Route path="/reports" element={<ReportsPage />} />

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

        <Route path="/settings/general" element={<SettingsGeneralPage />} />
        <Route path="/settings/transaction" element={<SettingsTransactionPage />} />
        <Route path="/settings/print" element={<SettingsPrintPage />} />
        <Route path="/settings/taxes" element={<SettingsTaxesPage />} />
        <Route path="/settings/messages" element={<SettingsMessagesPage />} />
        <Route path="/settings/party" element={<SettingsPartyPage />} />
        <Route path="/settings/item" element={<SettingsItemPage />} />
        <Route path="/settings/service-reminders" element={<SettingsServicePage />} />
        <Route path="/settings/accounting" element={<SettingsAccountingPage />} />

          {/* Add other app routes under AppLayout here */}
        </Routes>
      {/* </AppLayout> */}

      {/* Global modal renderer */}
      <ModalHost />
    </ModalProvider>
  );
}
