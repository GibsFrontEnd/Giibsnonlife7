"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../features/store"
import { getSubRiskSectionsBySubRisk } from "../../features/reducers/productReducers/subRiskSectionSlice"
import { getSubRiskSMIsBySectionCode } from "../../features/reducers/productReducers/subRiskSMISlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../UI/dialog"
import { Button } from "../UI/new-button"
import Input from "../UI/Input"
import { Label } from "../UI/label"
import type { QuoteSection, RiskItem} from "../../types/quotation"
import "./AddSectionModal.css"

import { calculateRiskItems } from "../../features/reducers/quoteReducers/quotationSlice"

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (section: QuoteSection) => void
  section?: QuoteSection
  productId: string

  // NEW optional prop: modal will call this with the full calculated risk array
  onCalculateFullRiskArray?: (sectionID: string, fullRiskArray: any[]) => void
}

export const AddSectionModal = ({ isOpen, onClose, onSave, section, productId, onCalculateFullRiskArray }: AddSectionModalProps) => {
  const dispatch = useDispatch()
  const { subRiskSections } = useSelector((state: RootState) => state.subRiskSections)
  const { subRiskSMIs } = useSelector((state: RootState) => state.subRiskSMIs)

  const initialForm = (): QuoteSection => ({
    sectionID: section?.sectionID || `section_${Date.now()}`,
    sectionName: section?.sectionName || "",
    location: section?.location || "",
    sectionSumInsured: section?.sectionSumInsured || 0,
    sectionPremium: section?.sectionPremium || 0,
    sectionNetPremium: (section as any)?.sectionNetPremium ?? 0,
    lastCalculated: (section as any)?.lastCalculated ?? null,
    proportionRate: /* (section as any)?.proportionRate ?? */ 100,
    riskItems: section?.riskItems
      ? (section.riskItems as any[]).map((it: any, idx: number) => ({
          itemNo: it.itemNo ?? idx + 1,
          sectionID: it.sectionID ?? it.sectionId ?? section?.sectionID ?? `section_${Date.now()}`,
          smiCode: it.smiCode ?? "",
          itemDescription: it.itemDescription ?? "",
          actualValue: it.actualValue ?? 0,
          itemRate: it.itemRate ?? 0,
          multiplyRate: it.multiplyRate ?? 1,
          location: it.location ?? "",
          feaDiscountRate: it.feaDiscountRate ?? 0,

          // server-calculated fields (display-only)
          actualPremium: it.actualPremium ?? 0,
          actualPremiumFormula: it.actualPremiumFormula ?? "",
          shareValue: it.shareValue ?? 0,
          shareValueFormula: it.shareValueFormula ?? "",
          premiumValue: it.premiumValue ?? 0,
          premiumValueFormula: it.premiumValueFormula ?? "",
          stockDiscountAmount: it.stockDiscountAmount ?? 0,
          feaDiscountAmount: it.feaDiscountAmount ?? 0,
          netPremiumAfterDiscounts: it.netPremiumAfterDiscounts ?? 0,
          stockItem: it.stockItem ?? null,

          // UI flags
          _showStock: !!it.stockItem,
          _collapsed: false,
        }))
      : [],
  })

  const [formData, setFormData] = useState<QuoteSection>(initialForm)
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>(section?.sectionID || "")

  // track applying state per-item (key: sectionID|index)
  const [applyingMap, setApplyingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (productId) dispatch(getSubRiskSectionsBySubRisk(productId) as any)
  }, [dispatch, productId])

  useEffect(() => {
    if (subRiskSections && subRiskSections.length > 0 && section?.sectionID) {
      setSelectedSectionCode(section.sectionID)
      setFormData(initialForm())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subRiskSections])

  useEffect(() => {
    if (selectedSectionCode) dispatch(getSubRiskSMIsBySectionCode(selectedSectionCode) as any)
  }, [dispatch, selectedSectionCode])

  useEffect(() => {
    if (section) {
      setFormData(initialForm())
      setSelectedSectionCode(section.sectionID)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  const keyFor = (index: number) => `${formData.sectionID || "sec"}|${index}`

  const handleSectionNameChange = (sectionCode: string) => {
    setSelectedSectionCode(sectionCode)
    const selected = subRiskSections.find((s) => s.sectionCode === sectionCode)
    if (selected) setFormData((p) => ({ ...p, sectionName: selected.sectionName, sectionID: sectionCode }))
    else setFormData((p) => ({ ...p, sectionName: "", sectionID: sectionCode }))
  }

  const handleAddItem = () => {
    const newItem: any = {
      // itemNo is not unique by your note — it's still displayed but not used to match server results
      itemNo: (formData.riskItems || []).length + 1,
      id: `local_${Date.now()}`, // internal local id for mapping UI reliably (not sent to API)
      sectionID: formData.sectionID || `section_${Date.now()}`,
      smiCode: "",
      itemDescription: "",
      actualValue: 0,
      itemRate: 0,
      multiplyRate: 1,
      location: "",
      feaDiscountRate: 0,
      actualPremium: 0,
      actualPremiumFormula: "",
      shareValue: 0,
      shareValueFormula: "",
      premiumValue: 0,
      premiumValueFormula: "",
      stockDiscountAmount: 0,
      feaDiscountAmount: 0,
      netPremiumAfterDiscounts: 0,
      stockItem: null,
      _showStock: false,
      _collapsed: false,
    }
    setFormData((prev) => ({ ...prev, riskItems: [ ...(prev.riskItems || []), newItem ] }))
  }

  const handleItemChange = (index: number, field: keyof RiskItem | string, value: any) => {
    const updated = [...(formData.riskItems as any[])]
    const numeric = ["actualValue", "itemRate", "multiplyRate", "feaDiscountRate"]
    const parsed = numeric.includes(field as string) ? (value === "" ? 0 : Number(value)) : value
    updated[index] = { ...updated[index], [field]: parsed }

    if (field === "smiCode") {
      const s = subRiskSMIs.find((x) => x.smiCode === value)
      if (s) updated[index].itemRate = (s as any).rate ?? (s as any).itemRate ?? (s as any).defaultRate ?? updated[index].itemRate
    }

    setFormData((p) => ({ ...p, riskItems: updated }))
  }

  const handleRemoveItem = (index: number) => {
    const updated = (formData.riskItems as any[]).filter((_, i) => i !== index).map((it, i) => ({ ...it, itemNo: i + 1 }))
    setFormData((p) => ({ ...p, riskItems: updated }))
  }

  const toggleStockUI = (index: number) => {
    const updated = [...(formData.riskItems as any[])]
    updated[index]._showStock = !updated[index]._showStock
    if (updated[index]._showStock && !updated[index].stockItem) {
      updated[index].stockItem = { stockCode: "", stockDescription: "", stockSumInsured: 0, stockRate: 0, stockDiscountRate: 0 }
    }
    setFormData((p) => ({ ...p, riskItems: updated }))
  }

  const handleStockChange = (index: number, field: string, value: any) => {
    const updated = [...(formData.riskItems as any[])]
    const stock = updated[index].stockItem ? { ...updated[index].stockItem } : {}
    const numeric = ["stockSumInsured", "stockRate", "stockDiscountRate"]
    stock[field] = numeric.includes(field) ? (value === "" ? 0 : Number(value)) : value
    updated[index].stockItem = stock
    setFormData((p) => ({ ...p, riskItems: updated }))
  }

  const toggleCollapse = (index: number) => {
    const updated = [...(formData.riskItems as any[])]
    updated[index]._collapsed = !updated[index]._collapsed
    setFormData((p) => ({ ...p, riskItems: updated }))
  }

  // ---------- SERVER-CALLED Apply for a single item ----------
  const handleApplyItem = async (index: number) => {
    const item = (formData.riskItems || [])[index]  
    if (!item) return

    const mapKey = keyFor(index)
    setApplyingMap((m) => ({ ...m, [mapKey]: true }))

    // build payload according to your API contract
    const payload = {
      subRisk: productId || "",
      riskItems: [
        {
          // fields accepted by API for calculation
          sectionID: item.sectionID,
          smiCode: item.smiCode,
          itemDescription: item.itemDescription,
          actualValue: Number(item.actualValue) || 0,
          itemRate: Number(item.itemRate) || 0,
          multiplyRate: Number(item.multiplyRate) || 1,
          location: item.location || "",
          feaDiscountRate: Number(item.feaDiscountRate) || 0,
          stockItem: item.stockItem
            ? {
                stockCode: item.stockItem.stockCode || "",
                stockDescription: item.stockItem.stockDescription || "",
                stockSumInsured: Number(item.stockItem.stockSumInsured) || 0,
                stockRate: Number(item.stockItem.stockRate) || 0,
                stockDiscountRate: Number(item.stockItem.stockDiscountRate) || 0,
              }
            : null,
        },
      ],
      proportionRate: (formData as any).proportionRate ?? 0,
    }

    try {
      const resp = await (dispatch(calculateRiskItems(payload)) as any).unwrap()

      // merge server result: server returns calculatedItems array and global totals
      if (resp && Array.isArray(resp.calculatedItems) && resp.calculatedItems.length > 0) {
        const c = resp.calculatedItems[0] // calculated item
        setFormData((prev) => {
          const items = [...(prev.riskItems || [])]

          // match item to update. Prefer the exact index passed in, but also attempt a safer match:
          let targetIndex = index
          const serverMatch = items.findIndex((it, i) => {
            // prefer exact id if present
            if (i === index) return true
            // fallback: match by sectionID + smiCode + itemDescription + actualValue
            return (
              it.sectionID === (c.sectionID ?? it.sectionID) &&
              (it.smiCode || "") === (c.smiCode || "") &&
              (String(it.itemDescription || "").trim() === String(c.itemDescription || "").trim()) &&
              Number(it.actualValue || 0) === Number(c.actualValue || it.actualValue || 0)
            )
          })
          if (serverMatch !== -1) targetIndex = serverMatch

          // merge server fields into UI item
          items[targetIndex] = {
            ...items[targetIndex],
            // keep editable fields from UI, but take server-updated values if provided
            actualValue: c.actualValue ?? items[targetIndex]?.actualValue,
            itemRate: c.itemRate ?? items[targetIndex]?.itemRate,
            multiplyRate: c.multiplyRate ?? items[targetIndex]?.multiplyRate,
            location: c.location ?? items[targetIndex]?.location,
            itemDescription: c.itemDescription ?? items[targetIndex]?.itemDescription,
            smiCode: c.smiCode ?? items[targetIndex]?.smiCode,

            // server-calculated fields
            actualPremium: c.actualPremium ?? items[targetIndex]?.actualPremium,
            actualPremiumFormula: (c as any).actualPremiumFormula ?? items[targetIndex]?.actualPremiumFormula,
            shareValue: (c as any).shareValue ?? items[targetIndex]?.shareValue,
            shareValueFormula: (c as any).shareValueFormula ?? items[targetIndex]?.shareValueFormula,
            premiumValue: (c as any).premiumValue ?? items[targetIndex]?.premiumValue,
            totalSumInsured: (c as any).totalSumInsured ?? items[targetIndex]?.totalSumInsured,
            premiumValueFormula: (c as any).premiumValueFormula ?? items[targetIndex]?.premiumValueFormula,
            stockDiscountAmount: (c as any).stockDiscountAmount ?? items[targetIndex]?.stockDiscountAmount ?? 0,
            feaDiscountAmount: (c as any).feaDiscountAmount ?? items[targetIndex]?.feaDiscountAmount ?? 0,
            netPremiumAfterDiscounts:
              (c as any).netPremiumAfterDiscounts ?? items[targetIndex]?.netPremiumAfterDiscounts ?? 0,
            stockItem: c.stockItem ?? items[targetIndex]?.stockItem ?? null,
          }

          // update section totals from server totals if present
          return {
            ...prev,
            riskItems: items,
            lastCalculated: new Date().toISOString(),
          }
        })
      } else {
        // server returned nothing useful
        console.warn("calculateRiskItems: empty response", resp)
      }
    } catch (err: any) {
      // adapt to your error UI (toasts, etc). For now simple alert:
      alert(err?.message || "Failed to calculate item")
    } finally {
      setApplyingMap((m) => {
        const copy = { ...m }
        delete copy[mapKey]
        return copy
      })
    }
  }

  // ---------- SERVER-CALLED Calculate ALL items ----------
  const handleCalculateAllItems = async () => {
    if (!formData.riskItems || formData.riskItems.length === 0) return

    const mapAllKey = "ALL"
    setApplyingMap((m) => ({ ...m, [mapAllKey]: true }))

    const payload = {
      subRisk: productId || "",
      riskItems: formData.riskItems.map((it: any) => ({
        sectionID: it.sectionID,
        smiCode: it.smiCode,
        itemDescription: it.itemDescription,
        actualValue: Number(it.actualValue) || 0,
        itemRate: Number(it.itemRate) || 0,
        multiplyRate: Number(it.multiplyRate) || 1,
        location: it.location || "",
        feaDiscountRate: Number(it.feaDiscountRate) || 0,
        stockItem: it.stockItem ?? null,
      })),
      proportionRate: (formData as any).proportionRate ?? 0,
    }

    // capture sectionID early for callback
    const sectionIdForCallback = formData.sectionID

    try {
      const resp = await (dispatch(calculateRiskItems(payload)) as any).unwrap()
      if (resp && Array.isArray(resp.calculatedItems)) {
        
        // build merged items array (same logic as before) but do it locally so we can pass it up immediately
        const mergedItems = [...(formData.riskItems || [])]

        resp.calculatedItems.forEach((cItem: any) => {
          // find best match (sectionID + smiCode + actualValue + description)
          const matchIndex = mergedItems.findIndex((it) =>
            it.sectionID === (cItem.sectionID ?? it.sectionID) &&
            ((it.smiCode || "") === (cItem.smiCode || "")) &&
            (String(it.itemDescription || "").trim() === String(cItem.itemDescription || "").trim()) &&
            (Number(it.actualValue || 0) === Number(cItem.actualValue || it.actualValue || 0))
          )

          // fallback strategy: match by index if no good match found (keeps previous behavior)
          const target = matchIndex !== -1 ? matchIndex : mergedItems.findIndex((_, i) => i === 0)

          if (target !== -1) {
            mergedItems[target] = {
              ...mergedItems[target],
              actualValue: cItem.actualValue ?? mergedItems[target].actualValue,
              itemRate: cItem.itemRate ?? mergedItems[target].itemRate,
              multiplyRate: cItem.multiplyRate ?? mergedItems[target].multiplyRate,
              location: cItem.location ?? mergedItems[target].location,
              itemDescription: cItem.itemDescription ?? mergedItems[target].itemDescription,
              smiCode: cItem.smiCode ?? mergedItems[target].smiCode,

              actualPremium: cItem.actualPremium ?? mergedItems[target].actualPremium,
              actualPremiumFormula: cItem.actualPremiumFormula ?? mergedItems[target].actualPremiumFormula,
              shareValue: cItem.shareValue ?? mergedItems[target].shareValue,
              shareValueFormula: cItem.shareValueFormula ?? mergedItems[target].shareValueFormula,
              premiumValue: cItem.premiumValue ?? mergedItems[target].premiumValue,
              premiumValueFormula: cItem.premiumValueFormula ?? mergedItems[target].premiumValueFormula,
              stockDiscountAmount: cItem.stockDiscountAmount ?? mergedItems[target].stockDiscountAmount,
              feaDiscountAmount: cItem.feaDiscountAmount ?? mergedItems[target].feaDiscountAmount,
              netPremiumAfterDiscounts: cItem.netPremiumAfterDiscounts ?? mergedItems[target].netPremiumAfterDiscounts,
              stockItem: cItem.stockItem ?? mergedItems[target].stockItem ?? null,
            }
          }
        })

        // compute new section totals from response (if provided) or keep old
        const newSectionSum = resp.totalActualValue ?? resp.totalSumInsured ?? formData.sectionSumInsured
        const newSectionPremium = resp.totalActualPremium ?? resp.totalGrossPremium ?? formData.sectionPremium
        const newSectionNet = resp.totalNetPremiumAfterDiscounts ?? formData.sectionNetPremium

        // update UI with merged result
        setFormData((prev) => ({
          ...prev,
          riskItems: mergedItems,
          sectionSumInsured: typeof newSectionSum === "number" ? newSectionSum : prev.sectionSumInsured,
          sectionPremium: typeof newSectionPremium === "number" ? newSectionPremium : prev.sectionPremium,
          sectionNetPremium: typeof newSectionNet === "number" ? newSectionNet : prev.sectionNetPremium,
          lastCalculated: new Date().toISOString(),
        }))
        

        // NEW: notify parent (QuoteCreator) with the full calculated risk array for this section
      }
    } catch (err: any) {
      alert(err?.message || "Failed to calculate all items")
    } finally {
      setApplyingMap((m) => {
        const c = { ...m }
        delete c["ALL"]
        return c
      })
    }
  }

  const handleSave = () => {
    if (!formData.sectionName) {
      alert("Please select a section name")
      return
    }
    try {
      if (onCalculateFullRiskArray) {
        const prepared = (formData.riskItems || []).map((mi) => ({
          ...mi,
          sectionID: mi.sectionID ?? formData.sectionID,
        }))
        onCalculateFullRiskArray(formData.sectionID, prepared)
      }
    } catch (cbErr) {
      console.warn("onCalculateFullRiskArray callback failed:", cbErr)
    }

    onSave(formData)
    console.log(formData);
  }

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(amount)

  const getSmiLabel = (smiCode: string) => {
    const sm = subRiskSMIs.find((s) => s.smiCode === smiCode)
    return sm ? (sm as any).smiDetails || sm.smiCode : smiCode || "—"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="add-section-modal">
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Add New Section"}</DialogTitle>
        </DialogHeader>

        <div className="modal-content">
          <div className="form-section">
            <h4>Section Information</h4>
            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="sectionName">Section Name *</Label>
                <select id="sectionName" value={selectedSectionCode} onChange={(e) => handleSectionNameChange(e.target.value)} className="form-select">
                  <option value="">Select Section</option>
                  {subRiskSections.map((s, index) => (
                    <option key={s.sectionCode + "" + index} value={s.sectionCode}>
                      {s.sectionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} placeholder="Enter location" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>Risk Items ({formData.riskItems.length})</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button onClick={handleAddItem} size="sm">Add Item</Button>
                <Button onClick={handleCalculateAllItems} size="sm" variant="outline" disabled={!!applyingMap["ALL"]}>
                  {applyingMap["ALL"] ? "Calculating..." : "Calculate All"}
                </Button>
              </div>
            </div>

            <div className="items-list">
              <div className="proportion-row">
                <Label htmlFor="proportionRateSmall">Proportion Rate (%)</Label>
                <Input
                  className="proportions-input"
                  id="proportionRateSmall"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={(formData as any).proportionRate ?? 0}
                  onChange={(e) => setFormData((p) => ({ ...p, proportionRate: e.target.value === "" ? 0 : Number(e.target.value) }))}
                  style={{ width: 120 }}

                 disabled
                />
              </div>

              {(formData.riskItems || []).map((item: any, index: number) => (
                <article key={`${item.sectionID}-${index}`} className={`item-card ${item._collapsed ? "collapsed" : ""}`} aria-labelledby={`item-${item.itemNo}`}>
                  <div className="card-top-controls">
                    <div className="top-left-meta" />
                    <div className="top-actions">
                      <button className="link-btn" onClick={() => toggleCollapse(index)} aria-label={item._collapsed ? "Expand item" : "Collapse item"}>
                        {item._collapsed ? "Expand ▾" : "Collapse ▴"}
                      </button>
                    </div>
                  </div>

                  {item._collapsed ? (
                    <>
                      <div className="collapsed-header-rich">
                        <div className="collapsed-left-rich">
                          <div className="label small">#{index + 1}</div>
                          <div className="value small desc">{item.itemDescription || "—"}</div>
                          <div className="muted small smi">{getSmiLabel(item.smiCode)}</div>
                        </div>

                        <div className="collapsed-mid-rich">
                          <div className="label small">Actual</div>
                          <div className="value small">{formatCurrency(item.actualValue || 0)}</div>
                          <div className="label small">Rate</div>
                          <div className="value small">{item.itemRate ?? 0}%</div>
                        </div>

                        <div className="collapsed-right-rich">
                          <div className="label small">Net</div>
                          <div className="value small">{item.netPremiumAfterDiscounts ? formatCurrency(item.netPremiumAfterDiscounts) : "N/A"}</div>
                          <div className="server-mini">{item.actualPremium ? formatCurrency(item.actualPremium) : ""}</div>
                        </div>
                      </div>

                      <footer className="card-footer">
                        <div className="footer-actions centered">
                          <Button onClick={() => handleApplyItem(index)} size="sm" className="apply-btn" disabled={!!applyingMap[keyFor(index)]}>
                            {applyingMap[keyFor(index)] ? "Applying..." : "Apply"}
                          </Button>
                          <Button onClick={() => handleRemoveItem(index)} size="sm" variant="outline" className="remove-btn">Remove</Button>
                        </div>
                      </footer>
                    </>
                  ) : (
                    <>
                      <div className="card-body">
                        <div className="card-row">
                          <div className="label">Item No</div>
                          <div className="value">{index + 1}</div>
                        </div>

                        <div className="card-row two-up">
                          <div>
                          <div className="label">Risk SMI</div>
                          <div className="value">
                            <select value={item.smiCode} onChange={(e) => handleItemChange(index, "smiCode", e.target.value)} className="input select">
                              <option value="">Select SMI</option>
                              {subRiskSMIs.map((smi, i) => (
                                <option key={smi.smiCode + "" + i} value={smi.smiCode}>{smi.smiDetails}</option>
                              ))}
                            </select>
                          </div>
                          </div>
                          <div>
                          <div className="label">Description</div>
                          <div className="value"><Input value={item.itemDescription} onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)} placeholder="Description" /></div>
                        </div>
                        </div>

                        <div className="card-row two-up">
                          <div>
                            <div className="label">Actual Value</div>
                            <div className="value"><Input type="number" min="0" step="0.01" value={item.actualValue} onChange={(e) => handleItemChange(index, "actualValue", e.target.value)} /></div>
                          </div>

                          <div>
                            <div className="label">Rate (%)</div>
                            <div className="value"><Input type="number" min="0" max="100" step="0.01" value={item.itemRate} onChange={(e) => handleItemChange(index, "itemRate", e.target.value)} /></div>
                          </div>
                        </div>

                        <div className="card-row two-up" style={{ marginTop: 8 }}>
                          <div>
                            <div className="label">Multiplier</div>
                            <div className="value"><Input type="number" min="0" step="0.01" value={item.multiplyRate} onChange={(e) => handleItemChange(index, "multiplyRate", e.target.value)} /></div>
                          </div>

                          <div>
                            <div className="label">Location</div>
                            <div className="value"><Input value={item.location} onChange={(e) => handleItemChange(index, "location", e.target.value)} placeholder="Location" /></div>
                          </div>
                        </div>

                        <div className="card-row" style={{ marginTop: 8 }}>
                          <div className="label">FEA Discount Rate (%)</div>
                          <div className="value">
                            <Input type="number" min="0" step="0.01" value={item.feaDiscountRate ?? 0} onChange={(e) => handleItemChange(index, "feaDiscountRate", e.target.value)} />
                          </div>
                        </div>

                        <div className="card-row" style={{ marginTop: 8 }}>
                          <div className="label">Stock</div>
                          <div className="value">
                            <label className="stock-toggle">
                              <input type="checkbox" checked={!!item._showStock} onChange={() => toggleStockUI(index)} />
                              <span style={{ marginLeft: 8 }}>Add stock</span>
                            </label>
                          </div>
                        </div>

                        {item._showStock && (
                          <div className="stock-block">
                            <div className="stock-row">
                              <div className="label">Stock Code</div>
                              <div className="value"><Input value={item.stockItem?.stockCode || ""} onChange={(e) => handleStockChange(index, "stockCode", e.target.value)} placeholder="Stock code" /></div>
                            </div>
                            <div className="stock-row">
                              <div className="label">Stock Description</div>
                              <div className="value"><Input value={item.stockItem?.stockDescription || ""} onChange={(e) => handleStockChange(index, "stockDescription", e.target.value)} placeholder="Stock description" /></div>
                            </div>
                            <div className="stock-row two-up">
                              <div>
                                <div className="label">Stock Sum Insured</div>
                                <div className="value"><Input type="number" value={item.stockItem?.stockSumInsured ?? 0} onChange={(e) => handleStockChange(index, "stockSumInsured", e.target.value)} /></div>
                              </div>
                              <div>
                                <div className="label">Stock Rate (%)</div>
                                <div className="value"><Input type="number" value={item.itemRate ?? 0} onChange={(e) => handleStockChange(index, "stockRate", e.target.value)} disabled /></div>
                              </div>
                            </div>
                            <div className="stock-row">
                              <div className="label">Stock Discount Rate (%)</div>
                              <div className="value"><Input type="number" value={item.stockItem?.stockDiscountRate ?? 0} onChange={(e) => handleStockChange(index, "stockDiscountRate", e.target.value)} /></div>
                            </div>
                          </div>
                        )}

                        <div className="discounts-area">
                          {item.stockDiscountAmount ? <div>Stock: {formatCurrency(item.stockDiscountAmount)}</div> : null}
                          {item.feaDiscountAmount ? <div>FEA: {formatCurrency(item.feaDiscountAmount)}</div> : null}
                        </div>

                        <div className="server-summary" role="region" aria-label={`Server premium for item ${item.itemNo}`}>
                          <div className="server-title">Actual Premium</div>
                          <div className="server-amount">{item.actualPremium ? formatCurrency(item.actualPremium) : "N/A"}</div>
                          {item.actualPremiumFormula && <div className="server-formula">{item.actualPremiumFormula}</div>}

                          <div style={{ marginTop: 8, display: "flex", gap: 10, flexDirection: "column" }}>
                            <div className="value" style={{ fontWeight: 700 }}>total Sum Insured: {formatCurrency(item.totalSumInsured ?? 0)}</div>

                            <div className="value" style={{ fontWeight: 700 }}>Shared Premium: {formatCurrency(item.premiumValue ?? 0)}</div>
                            {item.premiumValueFormula && <div className="server-formula">Premium Formula: {item.premiumValueFormula}</div>}

                            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                              <div className="muted">Stock Discount: {item.stockDiscountAmount ? formatCurrency(item.stockDiscountAmount) : formatCurrency(0)}</div>
                              <div className="muted">FEA Discount: {item.feaDiscountAmount ? formatCurrency(item.feaDiscountAmount) : formatCurrency(0)}</div>
                            </div>

                            <div className="server-net">Net: {item.netPremiumAfterDiscounts ? formatCurrency(item.netPremiumAfterDiscounts) : formatCurrency(0)}</div>
                          </div>
                        </div>
                      </div>

                      <footer className="card-footer">
                        <div className="footer-actions centered">
                          <Button onClick={() => handleApplyItem(index)} size="sm" className="apply-btn" disabled={!!applyingMap[keyFor(index)]}>
                            {applyingMap[keyFor(index)] ? "Applying..." : "Apply"}
                          </Button>
                          <Button onClick={() => handleRemoveItem(index)} size="sm" variant="outline" className="remove-btn">Remove</Button>
                        </div>
                      </footer>
                    </>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
              <Label>Total Sum Insured</Label>
              <div className="summary-value">{formatCurrency(formData.sectionSumInsured || 0)}</div>
            </div>
            <div className="summary-item">
              <Label>Total Premium</Label>
              <div className="summary-value">{formatCurrency(formData.sectionPremium || 0)}</div>
            </div>
            {formData.sectionNetPremium !== undefined && (
              <div className="summary-item">
                <Label>Net Premium</Label>
                <div className="summary-value">{formatCurrency((formData as any).sectionNetPremium || 0)}</div>
              </div>
            )}
            {formData.lastCalculated && (
              <div className="summary-item">
                <Label>Last Calculated</Label>
                <div className="summary-value">{new Date((formData as any).lastCalculated).toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <Button onClick={handleSave}>Save Section</Button>
            <Button onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSectionModal
