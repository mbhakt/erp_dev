import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  Home,
  Users,
  Box,
  ShoppingCart,
  DollarSign,
  Briefcase,
  Settings,
  RefreshCw,
  Database,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import {
  HomeOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  SaveOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import Collapsible, { PRESETS } from "./Collapsible";
import { useModal } from "../contexts/ModalContext";
import AboutPopup from "./AboutPopup";

/* MENU definition */
const MENU = [
  { key: "home", label: "Home", icon: Home, to: "/" },
  {
    key: "parties",
    label: "Parties",
    icon: Users,
    submenu: [
      { key: "parties.details", label: "Party Details", to: "/parties" },
      { key: "parties.whatsapp", label: "Whatsapp Connect", to: "/parties/whatsapp" },
      { key: "parties.network", label: "Vyavahar Network", to: "/parties/network" },
    ],
  },
  { key: "items", label: "Items", icon: Box, to: "/items", plus: false },
  {
    key: "sale",
    label: "Sale",
    icon: ShoppingCart,
    submenu: [
      { key: "sale.invoices", label: "Sale Invoices", to: "/sale/invoices" },
      { key: "sale.estimates", label: "Estimate / Quotations", to: "/sale/estimates" },
      { key: "sale.proforma", label: "Proforma Invoice", to: "/sale/proforma" },
      { key: "sale.order", label: "Sale Order", to: "/sale/orders" },
      { key: "sale.delivery", label: "Delivery Challan", to: "/sale/delivery" },
      { key: "sale.return", label: "Sale return/Credit Note", to: "/sale/returns" },
    ],
  },
  {
    key: "purchase",
    label: "Purchase & Expense",
    icon: DollarSign,
    submenu: [
      { key: "purchase.bills", label: "Purchase Bills", to: "/purchase/bills" },
      { key: "purchase.expenses", label: "Expenses", to: "/purchase/expenses" },
      { key: "purchase.order", label: "Purchase Order", to: "/purchase/orders" },
      { key: "purchase.note", label: "Purchase Note/Debit Note", to: "/purchase/notes" },
    ],
  },
  {
    key: "cashbank",
    label: "Cash & Bank",
    icon: Briefcase,
    submenu: [
      { key: "cash.bank", label: "Bank Accounts", to: "/cash/banks" },
      { key: "cash.cash", label: "Cash in Hand", to: "/cash/hand" },
      { key: "cash.cheques", label: "Cheques", to: "/cash/cheques" },
      { key: "cash.loan", label: "Loan Accounts", to: "/cash/loans" },
    ],
  },
  { key: "reports", label: "Reports", icon: BarChart2, to: "/reports" },
  {
    key: "sync",
    label: "Sync, Share & Backup",
    icon: RefreshCw,
    submenu: [
      { key: "sync.syncshare", label: "Sync & Share", to: "/sync/share" },
      { key: "sync.autobackup", label: "Auto Backup", to: "/sync/autobackup" },
      { key: "sync.backupComputer", label: "Backup to Computer", to: "/sync/backup/computer" },
      { key: "sync.backupDrive", label: "Backup to Drive", to: "/sync/backup/drive" },
      { key: "sync.restore", label: "Restore Backup", to: "/sync/restore" },
    ],
  },
  {
    key: "utilities",
    label: "Utilities",
    icon: Database,
    submenu: [
      { key: "util.importItems", label: "Import Items", to: "/utils/import/items" },
      { key: "util.importTally", label: "Import from Tally", to: "/utils/import/tally" },
      { key: "util.importParties", label: "Import Parties", to: "/utils/import/parties" },
      { key: "util.exportTally", label: "Exports to Tally", to: "/utils/export/tally" },
      { key: "util.exportItems", label: "Export Items", to: "/utils/export/items" },
      { key: "util.recalculate", label: "Recalculate Balances", to: "/utilities/recalculate" },
      { key: "util.cleanup", label: "Data Cleanup", to: "/utilities/cleanup" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    submenu: [
      { key: "settings.general", label: "General", to: "/settings/general" },
      { key: "settings.transaction", label: "Transaction", to: "/settings/transaction" },
      { key: "settings.print", label: "Print", to: "/settings/print" },
      { key: "settings.taxes", label: "Taxes & GST", to: "/settings/taxes" },
      { key: "settings.messages", label: "Transaction Message", to: "/settings/messages" },
      { key: "settings.party", label: "Party", to: "/settings/party" },
      { key: "settings.item", label: "Item", to: "/settings/item" },
      { key: "settings.service", label: "Service Reminders", to: "/settings/service-reminders" },
      { key: "settings.accounting", label: "Accounting", to: "/settings/accounting" },
      { key: "settings.company", label: "Company", to: "/settings/company" },
      { key: "settings.users", label: "Users", to: "/settings/users" },
    ],
  },
];

const LS_COLLAPSED = "ui.sidebar.collapsed.v1";
const LS_OPEN_KEY = "ui.sidebar.openKey.v1";

export default function Sidebar({ onAddItem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAddItem } = useModal();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(LS_COLLAPSED) === "true"; } catch { return false; }
  });
  const [openKey, setOpenKey] = useState(() => {
    try { return localStorage.getItem(LS_OPEN_KEY) || null; } catch { return null; }
  });
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(LS_COLLAPSED, String(collapsed)); } catch {}
    if (collapsed) setOpenKey(null);
  }, [collapsed]);

  useEffect(() => {
    try { localStorage.setItem(LS_OPEN_KEY, openKey || ""); } catch {}
  }, [openKey]);

  const selectedTopKey = useMemo(() => {
    const p = location.pathname;
    for (const m of MENU) {
      if (m.to && p === m.to) return m.key;
      if (m.submenu) {
        for (const s of m.submenu) {
          if (s.to && p.startsWith(s.to)) return m.key;
        }
      }
    }
    return null;
  }, [location.pathname]);

  const handleTopClick = (m) => {
    if (m.submenu && m.submenu.length) {
      setOpenKey(m.key);
      const first = m.submenu[0];
      if (first && first.to) navigate(first.to);
      return;
    }
    if (m.to) {
      navigate(m.to);
      setOpenKey(null);
    }
  };

  const handleCaretToggle = (e, m) => {
    e.stopPropagation();
    setOpenKey((prev) => (prev === m.key ? null : m.key));
  };

  const handlePlusClick = (e, m) => {
    e.stopPropagation();
    if (m.key === "items") {
      if (typeof onAddItem === "function") onAddItem();
      return;
    }
    if (m.plusTo) navigate(m.plusTo);
  };

  const handleItemSaved = (created) => {
    console.log("Item created", created);
    setShowAddItemModal(false);
  };

  // Use the new Vyapar preset
  const submenuPreset = "vyapar";
  const presetObj = PRESETS[submenuPreset];
  const caretDuration = presetObj.duration;
  const caretEasing = presetObj.easingOpen || presetObj.easing;
  const caretLag = presetObj.caretLag || 0;

  return (
    <>
      <aside
  className={`flex flex-col bg-slate-900 text-slate-100
    transition-[width] duration-500 ease-in-out
    ${collapsed ? "w-20" : "w-64"}`}
>
        <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded bg-slate-800 flex items-center justify-center font-bold ${collapsed ? "mx-auto" : ""}`}>M</div>
            {!collapsed && (
  <div className="text-sm font-semibold transition-opacity duration-500 delay-100 opacity-100">
    Mahalasa
  </div>
)}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded hover:bg-slate-700/30"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-auto p-2">
          <div className="space-y-1">
            {MENU.map((m) => {
              const Icon = m.icon;
              const isOpen = openKey === m.key;
              const isSelected = selectedTopKey === m.key;

              if (collapsed) {
                return (
                  <div key={m.key} className="relative group">
                    <button
                      onClick={() => {
                        if (m.submenu && m.submenu.length) {
                          const first = m.submenu[0];
                          if (first && first.to) navigate(first.to);
                          setOpenKey(m.key);
                          return;
                        }
                        if (m.key === "items") {
                          openAddItem("quick");
                          return;
                        }
                        if (m.to) navigate(m.to);
                      }}
                      title={m.label}
                      className="w-full flex items-center justify-center py-3 rounded text-slate-200 hover:bg-slate-700/30"
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                    </button>
                    {m.key === "items" && (
                      <button
                        onClick={(e) => handlePlusClick(e, m)}
                        title={`Add ${m.label}`}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-500 p-1 rounded text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div key={m.key} className="mb-1">
                  <div
                    onClick={() => handleTopClick(m)}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer select-none ${
                      isSelected ? "bg-slate-800/60" : "hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
  {Icon && <Icon className="w-5 h-5 text-slate-200" />}
  <div
    className={`text-sm text-slate-200 transition-opacity duration-500 ${
      collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
    }`}
  >
    {m.label}
  </div>
</div>

                    <div className="flex items-center gap-2">
                      {m.plus && (
                        <button
                          onClick={(e) => handlePlusClick(e, m)}
                          className="text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded flex items-center gap-1"
                          title={`Add ${m.label}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                      {m.submenu && (
                        <button
                          onClick={(e) => handleCaretToggle(e, m)}
                          aria-expanded={isOpen}
                          aria-controls={`submenu-${m.key}`}
                          className="p-1 rounded hover:bg-slate-700/20"
                          title={isOpen ? "Collapse" : "Expand"}
                        >
                          <ChevronDown
  className="w-4 h-4"
  style={{
    transition: `transform ${PRESETS.vyapar.duration}ms ${PRESETS.vyapar.easingOpen}`,
    transitionDelay: `${PRESETS.vyapar.caretLag}ms`,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
  }}
/>
                        </button>
                      )}
                    </div>
                  </div>

                  {m.submenu && (
                    <Collapsible isOpen={isOpen} preset={submenuPreset}>
                      <div id={`submenu-${m.key}`} className="pl-10 mt-1">
                        {m.submenu.map((s) => (
                          <NavLink
                            to={s.to}
                            key={s.key}
                            className={({ isActive }) =>
                              `block text-sm px-2 py-2 rounded my-1 transition-colors ${
                                isActive ? "bg-slate-700/40 text-white font-medium" : "text-slate-300 hover:bg-slate-700/20"
                              }`
                            }
                            onClick={() => setOpenKey(m.key)}
                          >
                            {s.label}
                          </NavLink>
                        ))}
                      </div>
                    </Collapsible>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-slate-800 transition-all duration-500">
  {!collapsed ? (
    <>
      <div className="text-xs text-slate-400 transition-opacity duration-500 delay-100">
        Developed and Designed by :
      </div>
      <button 
      onClick={() => setShowAbout(true)}
      className="mt-3 w-full bg-amber-500 text-slate-900 py-2 rounded text-sm font-semibold transition duration-500">
        Click Me
      </button>
    </>
  ) : (
    <div className="flex justify-center">
      <button className="p-2 bg-amber-500 text-slate-900 rounded transition duration-500" aria-hidden>
        <span className="sr-only">Upgrade</span>
      </button>
    </div>
  )}
</div>
{/* About popup */}
      {typeof showAbout !== "undefined" && (
        <AboutPopup open={showAbout} onClose={() => setShowAbout(false)} />
      )}
      </aside>
    </>
  );
}

