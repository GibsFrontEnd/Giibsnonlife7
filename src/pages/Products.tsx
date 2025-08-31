// src/pages/Products.tsx
import React, { useState } from "react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/UI/tabs";
import CreateProductModal from "../components/Modals/CreateProductModal";
import ProductsRisks from "../components/product-page/products.risks";
import "./Products.css";

/**
 * === How to use ===
 * Replace the `tabs` array below with your tabs array.
 *
 * Example (exactly what you asked for):
 * const tabs = [
 *   { title: "Risks", content: <ProductRisks /> }
 * ];
 *
 * If you reference components like ProductRisks or ProductList, import them above.
 * -------------------------------------------------------------------------------
 */

const DEFAULT_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

/* ============================
   Replace this tabs array only
   ============================
   Example:
   const tabs = [
     { title: "Risks", content: <ProductRisks /> },
     { title: "Products", content: <ProductsList /> }
   ]
*/
const tabs: { title: string; content: React.ReactNode }[] = [
  // put your tab objects here — replace the entire array with your own
  { title: "Risks", content: <ProductsRisks /> },
  { title: "Products", content: <ProductsRisks /> },
  // { title: "Products", content: <ProductsList /> },
];

const SearchControls: React.FC<{
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="search-controls">
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        className="search-input"
      />
      <Select
        options={DEFAULT_STATUS_OPTIONS}
        value={statusFilter}
        onChange={(e: any) => setStatusFilter(e.target.value)}
        className="status-filter"
      />
      <Button variant="secondary" size="sm">
        🔍
      </Button>
    </div>
  );
};

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(
    tabs.length > 0 ? tabs[0].title : "Products"
  );
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Active");

  const handleProductSubmit = (data: any) => {
    console.log("Product created:", data);
    setShowProductModal(false);
  };

  // If tabs array is empty, show a friendly placeholder
  if (!tabs || tabs.length === 0) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1>Products</h1>
        </div>

        <div className="empty-warning">
          <p>
            No tabs defined. Replace the `tabs` array at the top of this file
            with something like:
          </p>
          <pre style={{ background: "#f4f4f4", padding: 12 }}>
{`const tabs = [
  { title: "Risks", content: <ProductRisks /> },
  { title: "Products", content: <ProductsList /> }
]`}
          </pre>
        </div>

        <CreateProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSubmit={handleProductSubmit}
        />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.title}
              value={tab.title}
              className="flex-1 min-w-[100px] hover:bg-neutral-200"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.title} value={tab.title}>
            {/* If you'd like global search/filters for some tabs, you can include them in the tab's content.
                For convenience, we provide a SearchControls component that you can reuse inside tab content
                or place here globally by uncommenting the block below. */}
            {/* <div className="content-header">
              <SearchControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              <Button onClick={() => setShowProductModal(true)}>
                + Create Product...
              </Button>
            </div> */}

            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      <CreateProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
      />
    </div>
  );
};

export default Products;
