import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AddItemModal from "./AddItemModal";

export default function AppLayout({ children, onOpenInvoice }) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const handleItemSaved = (created) => {
    console.log("Item created", created);
    setShowAddItemModal(false);
    // You can dispatch event here if ItemsPage should update automatically:
    // window.dispatchEvent(new CustomEvent("item:created", { detail: created }));
  };

  return (
     <div className="flex h-screen bg-panel">
      <Sidebar onAddItem={() => setShowAddItemModal(true)} />
       <div className="flex-1 flex flex-col">
         <Topbar onOpenInvoice={onOpenInvoice} />
         <main className="p-6 overflow-auto">{children}</main>
       </div>

      {/* Add Item Modal lives here */}
      <AddItemModal
        open={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSaved={handleItemSaved}
      />
     </div>
   );
 }
