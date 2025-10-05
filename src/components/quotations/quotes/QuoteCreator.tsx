//@ts-nocheck
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import type { RootState } from "../../../features/store"
import {
  getProposalByNumber,
  calculateComplete,
  recalculateComplete,
  getCurrentCalculation,
  getCalculationBreakdown,
  getSectionsSummary,
  clearMessages,
  calculateMultiSectionAggregate,
  applyProposalAdjustments,
  calculateProRata,
} from "../../../features/reducers/quoteReducers/quotationSlice"
import { getAllProducts } from "../../../features/reducers/productReducers/productSlice"
import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import { Label } from "../../UI/label"
import { AddSectionModal } from "../../Modals/AddSectionModal"
import type { QuoteSection, CompleteCalculationRequest, ProposalAdjustments } from "../../../types/quotation"
import "./QuoteCreator.css"

// helpers (unchanged)
const getLatestSectionSummaries = (rawSections: any[] | undefined) => {
  if (!Array.isArray(rawSections) || rawSections.length === 0) return []

  const map = new Map<string, any>()
  rawSections.forEach((s) => {
    const id = s.sectionID ?? JSON.stringify(s)
    const existing = map.get(id)
    const ts = s.lastCalculated ? Date.parse(s.lastCalculated) : 0
    const existingTs = existing && existing.lastCalculated ? Date.parse(existing.lastCalculated) : 0
    if (!existing || ts >= existingTs) map.set(id, s)
  })
  return Array.from(map.values())
}

const normalizeCalculationBreakdown = (raw: any) => {
  if (!raw) return null
  if (raw.calculationSteps?.sectionCalculations) return raw

  const inputSections = raw.inputs?.sectionInputs || raw.sectionInputs || []
  const sectionCalculations = (inputSections || []).map((s: any, idx: number) => {
    const items = (s.riskItems || []).map((ri: any, i: number) => ({
      itemNo: ri.itemNo ?? i + 1,
      smiCode: ri.smiCode,
      itemDescription: ri.itemDescription,
      actualValue: ri.actualValue ?? 0,
      itemRate: ri.itemRate ?? 0,
      actualPremium: ri.actualPremium ?? ri.premiumValue ?? 0,
      actualPremiumFormula: ri.actualPremiumFormula ?? ri.actualPremiumFormula,
      stockDiscountAmount: ri.stockDiscountAmount ?? 0,
      feaDiscountAmount: ri.feaDiscountAmount ?? 0,
      netPremiumAfterDiscounts: ri.netPremiumAfterDiscounts ?? 0,
      shareValue: ri.shareValue ?? 0,
      premiumValue: ri.premiumValue ?? 0,
      multiplyRate: ri.multiplyRate ?? 0,
      sectionId: ri.sectionId ?? s.sectionID,
      location: ri.location ?? s.location,
      __raw: ri,
    }))

    return {
      sectionID: s.sectionID ?? `section-${idx}`,
      sectionName: s.sectionName ?? s.sectionDisplayName ?? `Section ${idx + 1}`,
      location: s.location,
      riskItemCalculations: {
        items,
        totals: {
          totalActualValue: s.sectionSumInsured ?? items.reduce((a: number, it: any) => a + (it.actualValue || 0), 0),
          totalSharePremium: s.sectionGrossPremium ?? items.reduce((a: number, it: any) => a + (it.actualPremium || 0), 0),
          totalNetPremiumAfterDiscounts: s.sectionNetPremium ?? 0,
        },
      },
      sectionAdjustments: {
        startingPremium: s.sectionGrossPremium ?? 0,
        discountsApplied: s.discountsApplied || [],
        loadingsApplied: s.loadingsApplied || [],
        finalNetPremium: s.sectionNetPremium ?? 0,
      },
      __raw: s,
    }
  })

  const finalResults = raw.finalResults ?? {
    totalSumInsured: inputSections.reduce((acc: number, s: any) => acc + (s.sectionSumInsured || 0), 0),
    totalPremium: inputSections.reduce((acc: number, s: any) => acc + (s.sectionGrossPremium || 0), 0),
    netPremium: inputSections.reduce((acc: number, s: any) => acc + (s.sectionNetPremium || 0), 0),
  }

  return {
    ...raw,
    calculationSteps: {
      sectionCalculations,
      proRataCalculations: raw.inputs?.proRataCalculations ?? raw.proRataCalculations,
    },
    finalResults,
    inputs: raw.inputs ?? raw,
  }
}

const QuoteCreator = () => {
  const { proposalNo } = useParams<{ proposalNo: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    currentProposal,
    sections,
    currentCalculation,
    calculationBreakdown,
    sectionsSummary: storeSectionsSummary,
    loading,
    success,
    error,
  } = useSelector((state: RootState) => state.quotations)
  const { products } = useSelector((state: RootState) => state.products)

  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  const [adjustments, setAdjustments] = useState<ProposalAdjustments>({
    specialDiscountRate: 0,
    deductibleDiscountRate: 0,
    spreadDiscountRate: 0,
    ltaDiscountRate: 0,
    otherDiscountsRate: 0,
    theftLoadingRate: 0,
    srccLoadingRate: 0,
    otherLoading2Rate: 0,
    otherLoadingsRate: 0,
  })

  const [remarks, setRemarks] = useState("")
  const [normalizedBreakdown, setNormalizedBreakdown] = useState<any | null>(null)

  // local (component) state to avoid showing stale summaries
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [localSectionsSummary, setLocalSectionsSummary] = useState<any | null>(null)

  // local-only sections array (used while server endpoints are disabled)
  const [localSections, setLocalSections] = useState<QuoteSection[] | null>(null)

  // stores the FULL calculated risk arrays produced by AddSectionModal's "Calculate All" button
  const [calculatedRiskMap, setCalculatedRiskMap] = useState<Record<string, any[]>>({})

  // store the result of applyProposalAdjustments call (startingPremium, discount amounts, netPremiumDue, etc.)
  const [proposalAdjustmentsResult, setProposalAdjustmentsResult] = useState<any | null>(null)

  // pro-rata: coverDays (user input) + result storage
  const [coverDays, setCoverDays] = useState<number>(365)
  const [proRataResult, setProRataResult] = useState<any | null>(null)

  // fetch token to prevent race conditions
  const sectionsFetchIdRef = useRef(0)

  // load proposal, current calculation, breakdown and sectionsSummary (with local clearing)
  useEffect(() => {
    if (!proposalNo) return

    const fetchId = ++sectionsFetchIdRef.current
    setLocalSectionsSummary(null)
    setSectionsLoading(true)

    dispatch(getProposalByNumber(proposalNo) as any)
    dispatch(getCurrentCalculation(proposalNo) as any)
    dispatch(getCalculationBreakdown(proposalNo) as any)

    Promise.resolve(dispatch(getSectionsSummary(proposalNo) as any))
      .then((res: any) => {
        console.log(res);
        
        const payload = res?.payload ?? res
        if (!payload) return
        if (sectionsFetchIdRef.current === fetchId) {
          setLocalSectionsSummary(payload)
          if (!localSections) {
            const initialSections = (payload.sections || []).map((s: any) => ({
              sectionID: s.sectionID,
              sectionName: s.sectionName,
              location: s.location,
              sectionSumInsured: s.sectionSumInsured ?? 0,
              sectionPremium: s.sectionPremium ?? s.sectionGrossPremium ?? 0,
              riskItems: s.riskItems ?? [],
            })) as QuoteSection[]
            setLocalSections(initialSections)
          }
        }
      })
      .catch((err) => {
        console.error("getSectionsSummary failed:", err)
      })
      .finally(() => {
        if (sectionsFetchIdRef.current === fetchId) setSectionsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, proposalNo])

  useEffect(() => {
    if (!storeSectionsSummary) return
    if (!sectionsLoading) {
      setLocalSectionsSummary(storeSectionsSummary)
      if (!localSections && Array.isArray(sections) && sections.length > 0) {
        setLocalSections(sections as QuoteSection[])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSectionsSummary, sectionsLoading])

  useEffect(() => {
    if (currentCalculation) {
      setAdjustments({
        specialDiscountRate: currentCalculation.specialDiscountRate || 0,
        deductibleDiscountRate: currentCalculation.deductibleDiscountRate || 0,
        spreadDiscountRate: currentCalculation.spreadDiscountRate || 0,
        ltaDiscountRate: currentCalculation.ltaDiscountRate || 0,
        otherDiscountsRate: currentCalculation.otherDiscountsRate || 0,
        theftLoadingRate: currentCalculation.theftLoadingRate || 0,
        srccLoadingRate: currentCalculation.srccLoadingRate || 0,
        otherLoading2Rate: currentCalculation.otherLoading2Rate || 0,
        otherLoadingsRate: currentCalculation.otherLoadingsRate || 0,
      })
      if (currentCalculation.remarks) setRemarks(currentCalculation.remarks)
    }
  }, [currentCalculation])

  useEffect(() => {
    const sectionInputs = calculationBreakdown?.inputs?.sectionInputs
    if (!sectionInputs?.length) return
  
    setLocalSections((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
  
      const incoming = sectionInputs.map((s: any) => ({
        sectionID: s.sectionID,
        sectionName: s.sectionName,
        location: s.location ?? "",
        sectionSumInsured: s.sectionSumInsured ?? 0,
        sectionPremium: s.sectionPremium ?? 0,
        sectionNetPremium: s.sectionNetPremium ?? 0,
        riskItems: s.riskItems ?? [],
      }))
  
      const existingIDs = new Set(safePrev.map((p) => p.sectionID))
      const merged = [
        ...safePrev,
        ...incoming.filter((s) => !existingIDs.has(s.sectionID)),
      ]
  
      return merged
    })
  }, [calculationBreakdown])
  

  // initialize coverDays from currentProposal (if present)
  useEffect(() => {
    if (currentProposal && typeof currentProposal.proRataDays === "number") {
      setCoverDays(currentProposal.proRataDays)
    }
  }, [currentProposal])

  useEffect(() => {
    if (proposalNo) {
      const proposalProductId = currentProposal && currentProposal.subRiskID
      if (proposalProductId) {
        dispatch(
          getAllProducts({
            riskId: proposalProductId,
            pageNumber: 1,
            pageSize: 100,
          }) as any,
        )
      }
    }
  }, [dispatch, proposalNo, currentProposal])

  useEffect(() => {
    if (success?.calculate) dispatch(clearMessages() as any)
  }, [success?.calculate, dispatch])

  useEffect(() => {
    if (calculationBreakdown) {
      try {
        const normalized = normalizeCalculationBreakdown(calculationBreakdown)
        setNormalizedBreakdown(normalized)
      } catch (err) {
        console.error("Normalization failed:", err)
        setNormalizedBreakdown(null)
      }
    } else {
      setNormalizedBreakdown(null)
    }
  }, [calculationBreakdown])

  const proposalProductId = currentProposal && currentProposal.subRiskID
  const currentProduct = products.find((p) => p.productID === proposalProductId)

  const handleAddSection = () => {
    setEditingSectionId(null)
    setShowAddSectionModal(true)
  }

  const handleEditSection = (sectionId: string) => {
    setEditingSectionId(sectionId)
    setShowAddSectionModal(true)
  }

  // LOCAL-only save / delete logic
  const handleSaveSection = async (section: QuoteSection) => {
    console.log(localSections);
    
    setLocalSections((prev) => {
      const list = prev ? [...prev] : []
      const idx = list.findIndex((s) => s.location === section.location)
      if (idx >= 0) {
        list[idx] = section
      } else {
        list.push(section)
        console.log(section);
        
      }
      console.log(JSON.stringify(list));
      
      return list
    })

    setLocalSectionsSummary((prev: any) => {
      const copy = prev ? { ...prev } : { sections: [] }
      const existingIdx = (copy.sections || []).findIndex((s: any) => s.sectionID === section.sectionID)
      const summarySection = {
        sectionID: section.sectionID,
        sectionName: section.sectionName,
        location: section.location,
        sectionSumInsured: section.sectionSumInsured,
        sectionPremium: section.sectionPremium,
        riskItems: section.riskItems,
        lastCalculated: new Date().toISOString(),
      }
      if (existingIdx >= 0) {
        copy.sections[existingIdx] = summarySection
      } else {
        copy.sections = [...(copy.sections || []), summarySection]
      }
      return copy
    })

    setShowAddSectionModal(false)
    setEditingSectionId(null)
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return

    setLocalSections((prev) => (prev ? prev.filter((s) => s.location !== sectionId) : null))
    setLocalSectionsSummary((prev: any) => {
      if (!prev) return prev
      return { ...prev, sections: (prev.sections || []).filter((s: any) => s.sectionID !== sectionId) }
    })
    setCalculatedRiskMap((m) => {
      const copy = { ...m }
      delete copy[sectionId]
      return copy
    })
  }

  // Receive full risk array from modal's "Calculate All"
  const handleReceiveFullRiskArray = (sectionID: string, fullRiskArray: any[]) => {
    setCalculatedRiskMap((prev) => ({ ...prev, [sectionID]: fullRiskArray }))

    const existsInLocalSections = !!(localSections && localSections.find((s) => s.sectionID === sectionID))
    const existsInSummary = !!(localSectionsSummary && Array.isArray(localSectionsSummary.sections) && localSectionsSummary.sections.find((s: any) => s.sectionID === sectionID))

    if (existsInLocalSections) {
      setLocalSections((prev) => {
        if (!prev) return prev
        return prev.map((s) => (s.sectionID === sectionID ? { ...s, riskItems: fullRiskArray, lastCalculated: new Date().toISOString() } : s))
      })
    }

    if (existsInLocalSections || existsInSummary) {
      setLocalSectionsSummary((prev: any) => {
        const copy = prev ? { ...prev } : { sections: [] }
        const sectionsArr = Array.isArray(copy.sections) ? [...copy.sections] : []
        const idx = sectionsArr.findIndex((s: any) => s.sectionID === sectionID)

        const updatedEntry = {
          ...(sectionsArr[idx] || {}),
          sectionID,
          riskItems: fullRiskArray,
          lastCalculated: new Date().toISOString(),
        }

        if (idx >= 0) sectionsArr[idx] = updatedEntry
        else sectionsArr.push(updatedEntry)

        return { ...copy, sections: sectionsArr }
      })
    }
  }

  // Build payload for multi-section aggregate (uses calculatedRiskMap when present)
  const buildMultiSectionPayload = () => {
    const authoritativeSections: any[] = localSections
      ? localSections
      : localSectionsSummary?.sections && localSectionsSummary.sections.length > 0
      ? localSectionsSummary.sections
      : sections || []
  
    const getSectionId = (s: any) => s.sectionID ?? s.sectionId ?? s.id ?? s.sectionName ?? `section-${Math.random().toString(36).slice(2, 8)}`
  
    const sectionsForPayload = authoritativeSections
      .map((s: any) => {
        const sid = getSectionId(s)
  
        // Prefer server-calculated array stored in calculatedRiskMap
        const calc = calculatedRiskMap[sid] ?? calculatedRiskMap[s.sectionID ?? s.sectionId ?? s.id ?? s.sectionName] ?? null
  
        // If we have a calculated array, normalize it into calculatedItems
        if (Array.isArray(calc) && calc.length > 0) {
          const calculatedItems = calc.map((ri: any, i: number) => ({
            itemNo: ri.itemNo ?? i + 1,
            sectionID: sid,
            smiCode: ri.smiCode ?? "",
            itemDescription: ri.itemDescription ?? ri.description ?? "",
            actualValue: Number(ri.actualValue ?? ri.value ?? 0),
            itemRate: Number(ri.itemRate ?? ri.rate ?? 0),
            multiplyRate: Number(ri.multiplyRate ?? ri.multiple ?? 1),
            location: ri.location ?? s.location ?? "",
            stockItem:
              ri.stockItem && typeof ri.stockItem === "object"
                ? {
                    stockCode: ri.stockItem.stockCode ?? "",
                    stockDescription: ri.stockItem.stockDescription ?? "",
                    stockSumInsured: Number(ri.stockItem.stockSumInsured ?? ri.stockItem.stockSum ?? 0),
                    stockRate: Number(ri.stockItem.stockRate ?? ri.stockItem.rate ?? 0),
                    stockDiscountRate: Number(ri.stockItem.stockDiscountRate ?? 0),
                  }
                : null,
            feaDiscountRate: Number(ri.feaDiscountRate ?? 0),
            // server-calculated fields (keep/normalize)
            actualPremium: Number(ri.actualPremium ?? 0),
            shareValue: Number(ri.shareValue ?? 0),
            premiumValue: Number(ri.premiumValue ?? 0),
            stockSumInsured: Number(ri.stockSumInsured ?? 0),
            stockGrossPremium: Number(ri.stockGrossPremium ?? 0),
            stockDiscountAmount: Number(ri.stockDiscountAmount ?? 0),
            stockNetPremium: Number(ri.stockNetPremium ?? 0),
            totalSumInsured: Number(ri.totalSumInsured ?? 0),
            totalGrossPremium: Number(ri.totalGrossPremium ?? 0),
            feaDiscountAmount: Number(ri.feaDiscountAmount ?? 0),
            netPremiumAfterDiscounts: Number(ri.netPremiumAfterDiscounts ?? 0),
          }))
  
          return {
            sectionID: sid,
            sectionName: s.sectionName ?? s.sectionDisplayName ?? `Section ${sid}`,
            calculatedItems,
          }
        }
  
        // fallback: map UI riskItems to calculatedItems shape (server will compute numbers)
        const rawRiskItems = Array.isArray(s.riskItems) ? s.riskItems : []
        const calculatedItems = rawRiskItems.map((ri: any, i: number) => ({
          itemNo: ri.itemNo ?? i + 1,
          sectionID: sid,
          smiCode: ri.smiCode ?? "",
          itemDescription: ri.itemDescription ?? ri.description ?? "",
          actualValue: Number(ri.actualValue ?? ri.value ?? 0),
          itemRate: Number(ri.itemRate ?? ri.rate ?? 0),
          multiplyRate: Number(ri.multiplyRate ?? ri.multiple ?? 1),
          location: ri.location ?? s.location ?? "",
          stockItem:
            ri.stockItem && typeof ri.stockItem === "object"
              ? {
                  stockCode: ri.stockItem.stockCode ?? "",
                  stockDescription: ri.stockItem.stockDescription ?? "",
                  stockSumInsured: Number(ri.stockItem.stockSumInsured ?? ri.stockItem.stockSum ?? 0),
                  stockRate: Number(ri.stockItem.stockRate ?? ri.stockItem.rate ?? 0),
                  stockDiscountRate: Number(ri.stockItem.stockDiscountRate ?? 0),
                }
              : null,
          feaDiscountRate: Number(ri.feaDiscountRate ?? 0),
          actualPremium: Number(ri.actualPremium ?? 0),
          shareValue: Number(ri.shareValue ?? 0),
          premiumValue: Number(ri.premiumValue ?? 0),
          stockSumInsured: Number(ri.stockSumInsured ?? 0),
          stockGrossPremium: Number(ri.stockGrossPremium ?? 0),
          stockDiscountAmount: Number(ri.stockDiscountAmount ?? 0),
          stockNetPremium: Number(ri.stockNetPremium ?? 0),
          totalSumInsured: Number(ri.totalSumInsured ?? ri.actualValue ?? 0),
          totalGrossPremium: Number(ri.totalGrossPremium ?? 0),
          feaDiscountAmount: Number(ri.feaDiscountAmount ?? 0),
          netPremiumAfterDiscounts: Number(ri.netPremiumAfterDiscounts ?? 0),
        }))
  
        return {
          sectionID: sid,
          sectionName: s.sectionName ?? s.sectionDisplayName ?? `Section ${sid}`,
          calculatedItems,
        }
      })
      .filter(Boolean)
  console.log(JSON.stringify(sectionsForPayload));
  
    // thunk accepts { sections: [...] }
    return { sections: sectionsForPayload }
  }
  // POST to calculate multi-section aggregate and apply result locally (expects your sectionAggregates response)
  const calculateMultiSectionAggregateLocal = async () => {
    const authoritativeSections: any[] =
      localSections?.length
        ? localSections
        : localSectionsSummary?.sections?.length
        ? localSectionsSummary.sections
        : sections || []
  
    if (!authoritativeSections || authoritativeSections.length === 0) {
      alert("No sections available to aggregate.")
      return
    }
  
    const payload = buildMultiSectionPayload()
  
    try {
      // Dispatch your thunk instead of doing fetch here
      const resultAction = await dispatch(calculateMultiSectionAggregate(payload))
  
      if (calculateMultiSectionAggregate.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Aggregate calculation failed")
      }
  
      const raw = resultAction.payload
      const aggregates: any[] = Array.isArray(raw?.sectionAggregates)
        ? raw.sectionAggregates
        : Array.isArray(raw?.sections)
        ? raw.sections
        : []
  
      if (!aggregates.length) {
        alert("Aggregate returned no section results.")
        return
      }
  
      const normalized = aggregates.map((agg: any) => ({
        sectionID: agg.sectionID ?? agg.sectionId ?? agg.id,
        sectionName: agg.sectionName ?? agg.sectionDisplayName,
        sectionSumInsured: typeof agg.sectionSumInsured === "number" ? agg.sectionSumInsured : undefined,
        sectionPremium:
          typeof agg.sectionAggregatePremium === "number"
            ? agg.sectionAggregatePremium
            : typeof agg.sectionPremium === "number"
            ? agg.sectionPremium
            : undefined,
        riskItemCount: typeof agg.riskItemCount === "number" ? agg.riskItemCount : undefined,
        raw: agg,
      }))
  
      setLocalSectionsSummary((prev: any) => {
        const copy = prev ? { ...prev } : { sections: [] }
        const sectionsArr = Array.isArray(copy.sections) ? [...copy.sections] : []
  
        normalized.forEach((n) => {
          if (!n.sectionID) return
          const idx = sectionsArr.findIndex((s: any) => s.sectionID === n.sectionID)
          const existing = sectionsArr[idx] || {}
          const updated = {
            ...existing,
            sectionID: n.sectionID,
            sectionName: n.sectionName ?? existing.sectionName ?? "",
            sectionSumInsured: typeof n.sectionSumInsured === "number" ? n.sectionSumInsured : existing.sectionSumInsured ?? 0,
            sectionPremium: typeof n.sectionPremium === "number" ? n.sectionPremium : existing.sectionPremium ?? 0,
            netPremium: typeof n.sectionNetPremium === "number" ? n.sectionNetPremium : existing.netPremium ?? existing.sectionNetPremium ?? 0,
            riskItemCount: typeof n.riskItemCount === "number" ? n.riskItemCount : existing.riskItemCount ?? (existing.riskItems ? existing.riskItems.length : 0),
            lastCalculated: new Date().toISOString(),
          }
          if (idx >= 0) sectionsArr[idx] = updated
          else sectionsArr.push(updated)
        })
  
        return { ...copy, sections: sectionsArr }
      })
  
      setLocalSections((prev) => {
        const list = prev ? [...prev] : []
        normalized.forEach((n) => {
          if (!n.sectionID) return
          const idx = list.findIndex((s) => s.sectionID === n.sectionID)
          const existing = idx >= 0 ? list[idx] : undefined
          const updatedSection: QuoteSection = {
            sectionID: n.sectionID,
            sectionName: n.sectionName ?? existing?.sectionName ?? "",
            location: existing?.location ?? "",
            sectionSumInsured: typeof n.sectionSumInsured === "number" ? n.sectionSumInsured : existing?.sectionSumInsured ?? 0,
            sectionPremium: typeof n.sectionPremium === "number" ? n.sectionPremium : existing?.sectionPremium ?? 0,
            riskItems: existing?.riskItems ?? (calculatedRiskMap[n.sectionID] ?? []),
          }
          if (idx >= 0) list[idx] = updatedSection
          else list.push(updatedSection)
        })
        return list
      })
  
      alert("Multi-section aggregate calculated and applied locally.")
    } catch (err: any) {
      console.error("Aggregate calculation failed:", err)
      alert(`Failed to calculate aggregate: ${err?.message ?? err}`)
    }
  }
    // Build payload for applyProposalAdjustments (matches your curl)
  const buildProposalAdjustmentsPayload = () => {
    const authoritativeSections: any[] = localSections
      ? localSections
      : localSectionsSummary?.sections && localSectionsSummary.sections.length > 0
      ? localSectionsSummary.sections
      : sections || []

    // compute a starting totalAggregatePremium value from section premiums if totalAggregatePremium not provided explicitly
    const totalFromSections = authoritativeSections.reduce((acc: number, s: any) => acc + (s.sectionPremium ?? s.sectionGrossPremium ?? 0), 0)

    return {
      // your curl didn't include proposalNo in request body; adjust if your API requires it
      totalAggregatePremium: Math.max(0, totalFromSections),
      specialDiscountRate: adjustments.specialDiscountRate,
      deductibleDiscountRate: adjustments.deductibleDiscountRate,
      spreadDiscountRate: adjustments.spreadDiscountRate,
      ltaDiscountRate: adjustments.ltaDiscountRate,
      otherDiscountsRate: adjustments.otherDiscountsRate,
      theftLoadingRate: adjustments.theftLoadingRate,
      srccLoadingRate: adjustments.srccLoadingRate,
      otherLoading2Rate: adjustments.otherLoading2Rate,
      otherLoadingsRate: adjustments.otherLoadingsRate,
    }
  }

  // Handler that dispatches applyProposalAdjustments and stores returned amounts locally
  const handleApplyProposalAdjustments = async () => {
    if (!proposalNo && !localSections) {
      // allow local-only operation; not strictly requiring proposalNo
      // but inform the user
      console.warn("Applying proposal adjustments locally (no proposalNo).")
    }

    const payload = buildProposalAdjustmentsPayload()
    console.log(payload);
    

    try {
      // @ts-ignore
      const res = await (dispatch(applyProposalAdjustments(payload)) as any).unwrap?.() ?? (await dispatch(applyProposalAdjustments(payload) as any))

      // res expected shape from your curl:
      // {
      //  startingPremium,
      //  specialDiscountAmount,
      //  specialDiscountNetAmount,
      //  ...
      //  netPremiumDue,
      //  success,
      //  message
      // }
      setProposalAdjustmentsResult(res || null)

      // refresh breakdown if we have a proposalNo so UI matches server state (optional)
      if (proposalNo) {
        await dispatch(getCalculationBreakdown(proposalNo) as any)
      }

      alert(res?.message ?? "Proposal adjustments applied.")
    } catch (err: any) {
      console.error("applyProposalAdjustments failed:", err)
      alert(err?.message || "Failed to apply proposal adjustments")
    }
  }

  const handleApplyAndCalculate = async () => {
    await handleApplyProposalAdjustments()
    // run your top-level calculate to persist final totals if needed
    await handleCalculate()
  }

  // ---------- Step 5: Pro-Rata ----------
  // Picks best available netPremium: prefer proposalAdjustmentsResult, fall back to calculation/breakdown
  const getAuthoritativeNetPremium = () => {
    if (proposalAdjustmentsResult && typeof proposalAdjustmentsResult.netPremiumDue === "number") return proposalAdjustmentsResult.netPremiumDue
    if (currentCalculation && typeof currentCalculation.netPremium === "number") return currentCalculation.netPremium
    if (normalizedBreakdown?.finalResults && typeof normalizedBreakdown.finalResults.netPremium === "number") return normalizedBreakdown.finalResults.netPremium
    if (calculationBreakdown?.finalResults && typeof calculationBreakdown.finalResults.netPremium === "number") return calculationBreakdown.finalResults.netPremium
    return 0
  }

  const handleCalculateProRata = async () => {
    const netPremium = getAuthoritativeNetPremium()
    if (!netPremium || Number(netPremium) <= 0) {
      alert("No net premium available to pro-rate. Run proposal adjustments or a calculation first.")
      return
    }

    const payload = {
      netPremiumDue: Number(netPremium),
      coverDays: Number(coverDays || 0),
    }

    try {
      // @ts-ignore
      const res = await (dispatch(calculateProRata(payload)) as any).unwrap?.() ?? (await dispatch(calculateProRata(payload) as any))
      setProRataResult(res || null)

      // optionally refresh breakdown if server persisted something
      if (proposalNo) {
        await dispatch(getCalculationBreakdown(proposalNo) as any)
      }

      alert(res?.message ?? "Pro-rata calculation complete.")
    } catch (err: any) {
      console.error("calculateProRata failed:", err)
      alert(err?.message || "Failed to calculate pro-rata")
    }
  }

  // convenience: run pro-rata then top-level calculate to persist final totals
  const handleProRataAndCalculate = async () => {
    await handleCalculate()
  }

  const handleCalculate = async () => {
    if (!proposalNo || !currentProposal) return

    const calculationRequest: CompleteCalculationRequest = {
      proposalNo,
      sections,
      proportionRate: currentProposal.proportionRate,
      exchangeRate: currentProposal.exRate,
      currency: currentProposal.exCurrency,
      coverDays: currentProposal.proRataDays || 365,
      ...adjustments,
      calculatedBy: "SYSTEM",
      remarks,
    }

    try {
      if (currentCalculation) {
        // @ts-ignore
        await (dispatch(recalculateComplete({ proposalNo, calculationData: calculationRequest }) as any).unwrap?.() ??
          dispatch(recalculateComplete({ proposalNo, calculationData: calculationRequest }) as any))
      } else {
        // @ts-ignore
        await (dispatch(calculateComplete({ proposalNo, calculationData: calculationRequest }) as any).unwrap?.() ??
          dispatch(calculateComplete({ proposalNo, calculationData: calculationRequest }) as any))
      }

      await dispatch(getCalculationBreakdown(proposalNo) as any)

      // re-fetch sections summary safely
      const fetchId = ++sectionsFetchIdRef.current
      setSectionsLoading(true)
      await Promise.resolve(dispatch(getSectionsSummary(proposalNo) as any))
        .then((res: any) => {
          const payload = res?.payload ?? res
          if (payload && sectionsFetchIdRef.current === fetchId) setLocalSectionsSummary(payload)
        })
        .catch(() => {})
        .finally(() => {
          if (sectionsFetchIdRef.current === fetchId) setSectionsLoading(false)
        })
    } catch (err) {
      console.error("Calculation failed:", err)
      alert("Calculation failed. See console for details.")
    }
  }

  const handleCancel = () => {
    navigate(`/quotations/edit/${proposalNo}`)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (loading?.fetchProposals || !currentProposal) {
    return <div className="qc-container qc-loading">Loading proposal...</div>
  }

  const breakdown = normalizedBreakdown || calculationBreakdown

  return (
    <div className="qc-container">
      <div className="qc-header">
        <div>
          <h1>Quote Creator</h1>
          <p className="qc-proposal-info">
            Proposal: {currentProposal.proposalNo} | Product: {currentProduct?.productName || "N/A"}
          </p>
        </div>
        <div className="qc-header-actions">
          <Button onClick={handleCancel} variant="outline">
            Back to Proposal
          </Button>
          <Button onClick={handleCalculate} disabled={loading?.calculate || sections.length === 0}>
            {loading?.calculate ? "Calculating..." : currentCalculation ? "Recalculate" : "Calculate"}
          </Button>
        </div>
      </div>

      {error?.calculate && <div className="qc-error-message">{error.calculate}</div>}
      {success?.calculate && <div className="qc-success-message">Calculation completed successfully!</div>}

      <div className="qc-content">
        {/* Sections Panel */}
        <div className="qc-sections-panel">
          <div className="qc-sections-header">
            <h3>
              Sections (
              {localSectionsSummary?.sections && localSectionsSummary.sections.length > 0
                ? getLatestSectionSummaries(localSectionsSummary.sections).length
                : (localSections && localSections.length) || sections.length}
              )
            </h3>
            <Button onClick={handleAddSection} size="sm">
              Add Section
            </Button>
          </div>

          {(() => {
            const summaryList = localSectionsSummary?.sections ? getLatestSectionSummaries(localSectionsSummary.sections) : null
            const listToRender = localSections && localSections.length > 0 ? localSections : summaryList && summaryList.length > 0 ? summaryList : sections
            

            if (sectionsLoading) {
              return (
                <div className="qc-no-sections qc-loading-sections">
                  <p>Loading sections…</p>
                </div>
              )
            }

            if (!listToRender || listToRender.length === 0) {
              return (
                <div className="qc-no-sections">
                  <p>No sections added yet. Click "Add Section" to begin.</p>
                </div>
              )
            }

            return (
              <div className="qc-sections-list">
                {listToRender.map((section: any) => {              
                  const id = (section.sectionID)
                  const name = section.sectionName ?? "Unnamed Section"
                  const location = section.location ?? ""
/*                   const itemCount = (calculatedRiskMap[id] ?? section.riskItemCount ?? section.riskItems?.length ?? 0) || 0
 */                  const sumInsured = section.sectionSumInsured ?? section.sectionSumInsured ?? 0
                  const premium = section.sectionGrossPremium ?? section.sectionPremium ?? 0
                  const lastCalc = section.lastCalculated ?? null

                  return (
                    <div key={id} className="qc-section-card">
                      <div className="qc-section-info">
                        <h4>{name}</h4>
                        <p>Location: {location || "N/A"}</p>
{/*                         <p>Items: {itemCount}</p>
 */}                        <div className="qc-section-amounts">
                          <span>Sum Insured: {formatCurrency(sumInsured)}</span>
                          <span>Premium: {formatCurrency(premium)}</span>
                        </div>
                        {lastCalc && <div className="qc-section-lastcalc">Last calculated: {new Date(lastCalc).toLocaleString()}</div>}
                      </div>
                      <div className="qc-section-actions">
                        <Button onClick={() => handleEditSection(location)} size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button onClick={() => handleDeleteSection(location)} size="sm" variant="outline" className="qc-delete-btn">
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Calculate Aggregate Button */}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={calculateMultiSectionAggregateLocal} size="sm" variant="solid">
              Calculate Aggregate (all sections)
            </Button>
          </div>
        </div>

        {/* Adjustments panel */}
        <div className="qc-adjustments-panel">
          <h3>Premium Adjustments</h3>

          <div className="qc-adjustments-grid">
            <div className="qc-adjustment-section">
              <h4>Discounts</h4>
              <div className="qc-adjustment-field">
                <Label htmlFor="specialDiscountRate">Special Discount (%)</Label>
                <Input
                  id="specialDiscountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.specialDiscountRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, specialDiscountRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="deductibleDiscountRate">Deductible Discount (%)</Label>
                <Input
                  id="deductibleDiscountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.deductibleDiscountRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, deductibleDiscountRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="spreadDiscountRate">Spread Discount (%)</Label>
                <Input
                  id="spreadDiscountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.spreadDiscountRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, spreadDiscountRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="ltaDiscountRate">LTA Discount (%)</Label>
                <Input
                  id="ltaDiscountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.ltaDiscountRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, ltaDiscountRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="otherDiscountsRate">Other Discounts (%)</Label>
                <Input
                  id="otherDiscountsRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.otherDiscountsRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, otherDiscountsRate: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="qc-adjustment-section">
              <h4>Loadings</h4>
              <div className="qc-adjustment-field">
                <Label htmlFor="theftLoadingRate">Theft Loading (%)</Label>
                <Input
                  id="theftLoadingRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.theftLoadingRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, theftLoadingRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="srccLoadingRate">SRCC Loading (%)</Label>
                <Input
                  id="srccLoadingRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.srccLoadingRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, srccLoadingRate: Number(e.target.value) }))}
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="otherLoading2Rate">Other Loading 2 (%)</Label>
                <Input
                  id="otherLoading2Rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.otherLoading2Rate}
                  onChange={(e) =>
                    setAdjustments((prev) => ({ ...prev, otherLoading2Rate: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="qc-adjustment-field">
                <Label htmlFor="otherLoadingsRate">Other Loadings (%)</Label>
                <Input
                  id="otherLoadingsRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={adjustments.otherLoadingsRate}
                  onChange={(e) => setAdjustments((prev) => ({ ...prev, otherLoadingsRate: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="qc-remarks-field">
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks..."
              className="qc-remarks-textarea"
              rows={4}
            />
          </div>

          {/* coverDays input for pro-rata */}
          <div style={{ marginTop: 30,marginBottom:30, display: "flex", alignItems: "center", gap: 8,width:"40%" }}>
            <Label htmlFor="coverDaysSmall">Cover Days</Label>
            <Input
              id="coverDaysSmall"
              type="number"
              min="0"
              step="1"
              value={coverDays}
              onChange={(e) => setCoverDays(Number(e.target.value || 0))}
              style={{ width: 120 }}
            />
            <div style={{ fontSize: 12, color: "#666" }}>Used for pro-rata calculation</div>
          </div>

          {/* Proposal adjustments action buttons */}
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Button onClick={handleApplyProposalAdjustments} size="sm" variant="outline">
              Apply Proposal Adjustments
            </Button>
{/*             <Button onClick={handleApplyAndCalculate} size="sm">
              Apply & Calculate Proposal
            </Button>
 */}            <Button onClick={handleCalculateProRata} size="sm" variant="outline">
              Calculate Pro-Rata
            </Button>
{/*             <Button onClick={handleProRataAndCalculate} size="sm">
              Pro-Rata & Calculate Proposal
            </Button>
 */}          </div>

          {/* Show proposal-adjustments response (if present) */}
          {proposalAdjustmentsResult && (
  <div className="proposal-adjustments-card">
    <div className="card-header">
      <h4>Proposal Adjustments</h4>
      <span className="badge success">Applied</span>
    </div>

    <div className="card-body two-column">
      <div className="summary-column">
        <div className="summary-row">
          <div className="label">Starting Premium</div>
          <div className="value">{formatCurrency(proposalAdjustmentsResult.startingPremium)}</div>
        </div>

        <div className="summary-row">
          <div className="label">Net Premium Due</div>
          <div className="value highlight">{formatCurrency(proposalAdjustmentsResult.netPremiumDue)}</div>
        </div>

        <div className="divider" />

        <div className="mini-grid">
          <div className="mini-item">
            <div className="mini-label">Special Discount</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.specialDiscountAmount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">Deductible Discount</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.deductibleDiscountAmount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">Spread Discount</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.spreadDiscountAmount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">LTA Discount</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.ltaDiscountAmount)}</div>
          </div>
        </div>
      </div>

      <div className="summary-column">
        <div className="section-title">Loadings</div>
        <div className="mini-grid">
          <div className="mini-item">
            <div className="mini-label">Theft Loading</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.theftLoadingAmount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">SRCC Loading</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.srccLoadingAmount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">Other Loading 2</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.otherLoading2Amount)}</div>
          </div>
          <div className="mini-item">
            <div className="mini-label">Other Loadings</div>
            <div className="mini-value">{formatCurrency(proposalAdjustmentsResult.otherLoadingsAmount)}</div>
          </div>
        </div>

        <div className="divider" />

        <div className="footer-note">
          <small className="muted">{proposalAdjustmentsResult.message ?? "Proposal-level adjustments applied."}</small>
        </div>
      </div>
    </div>
  </div>
)}
          {/* Show Pro-Rata result (if present) */}
          {proRataResult && (
  <div className="pro-rata-card">
    <div className="card-header">
      <h4>Pro-Rata</h4>
      <span className={`badge ${proRataResult.isProRated ? "info" : "muted"}`}>{proRataResult.isProRated ? "Pro-Rated" : "Not Pro-Rated"}</span>
    </div>

    <div className="card-body pro-rata-grid">
      <div className="pr-row">
        <div className="pr-label">Base Net Premium</div>
        <div className="pr-value">{formatCurrency(proRataResult.netPremiumDue)}</div>
      </div>

      <div className="pr-row">
        <div className="pr-label">Pro-Rata Premium</div>
        <div className="pr-value">{formatCurrency(proRataResult.proRataPremium)}</div>
      </div>

      <div className="pr-row">
        <div className="pr-label">Premium Due</div>
        <div className="pr-value">{formatCurrency(proRataResult.premiumDue ?? proRataResult.proRataPremium)}</div>
      </div>

      <div className="pr-row">
        <div className="pr-label">Cover Days</div>
        <div className="pr-value">{proRataResult.coverDays ?? coverDays ?? "—"}</div>
      </div>
    </div>
  </div>
)}     
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent:"flex-end", }}>
            <Button onClick={handleProRataAndCalculate} size="sm">
              Calculate Final Quotation
            </Button>
          </div>

</div>

        {/* Calculation results & breakdown */}
        {currentCalculation && (
          <div className="qc-calculation-results">
            <div className="qc-results-header">
              <h3>Calculation Results</h3>
              {breakdown && (
                <Button onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)} variant="outline" size="sm">
                  {showDetailedBreakdown ? "Show Summary" : "Show Detailed Breakdown"}
                </Button>
              )}
            </div>

            {!showDetailedBreakdown ? (
              <>
                <div className="qc-results-grid">
                  <div className="qc-result-item">
                    <Label>Total Sum Insured</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.totalSumInsured)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Total Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.totalPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Net Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.netPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Pro-Rata Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.proRataPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Share Sum Insured</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.shareSumInsured)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Share Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.sharePremium)}</div>
                  </div>
                </div>

                {localSectionsSummary && localSectionsSummary.sections && localSectionsSummary.sections.length > 0 && (
  <div className="qc-sections-summary">
    <h4>Sections Summary</h4>
    <div className="qc-sections-summary-table card-table">
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th className="right">Sum Insured</th>
            <th className="right">Premium</th>
            <th className="right">Net Premium</th>
            <th className="center">Last Calculated</th>
          </tr>
        </thead>
        <tbody>
          {localSectionsSummary.sections.map((section: any) => (
            <tr key={section.sectionID}>
              <td>
                <div className="section-name">{section.sectionName}</div>
                <div className="muted small">{section.location || "—"}</div>
              </td>
              <td className="right">{formatCurrency(section.sectionSumInsured)}</td>
              <td className="right">{formatCurrency(section.sectionPremium)}</td>
              <td className="right highlight">{formatCurrency(section.netPremium ?? section.sectionNetPremium ?? 0)}</td>
              <td className="center">{section.lastCalculated ? new Date(section.lastCalculated).toLocaleString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
                {currentCalculation.validationErrors && currentCalculation.validationErrors.length > 0 && (
                  <div className="qc-validation-errors">
                    <h4>Validation Issues:</h4>
                    <ul>
                      {currentCalculation.validationErrors.map((err: any, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              breakdown && (
                <div className="qc-detailed-breakdown">
                {/* Calculation Metadata */}
                <div className="qc-breakdown-section">
                  <h4>Calculation Information</h4>
                  <div className="qc-info-grid">
                    <div className="qc-info-item">
                      <Label>Calculated On</Label>
                      <div className="qc-info-value">{breakdown.calculatedOn ? new Date(breakdown.calculatedOn).toLocaleString() : "N/A"}</div>
                    </div>
                    <div className="qc-info-item">
                      <Label>Calculated By</Label>
                      <div className="qc-info-value">{breakdown.calculatedBy || "N/A"}</div>
                    </div>
                    <div className="qc-info-item">
                      <Label>Type</Label>
                      <div className="qc-info-value">{breakdown.calculationType || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Show inputs if present */}
                {breakdown.inputs && (
                  <div className="qc-breakdown-section">
                    <h4>Calculation Inputs</h4>
                    <div className="qc-info-grid">
                      <div className="qc-info-item">
                        <Label>Proportion Rate</Label>
                        <div className="qc-info-value">{breakdown.inputs.proportionRate ?? "N/A"}%</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Exchange Rate</Label>
                        <div className="qc-info-value">{breakdown.inputs.exchangeRate ?? "N/A"}</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Currency</Label>
                        <div className="qc-info-value">{breakdown.inputs.currency ?? "N/A"}</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Cover Days</Label>
                        <div className="qc-info-value">{breakdown.inputs.coverDays ?? "N/A"}</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Start</Label>
                        <div className="qc-info-value">{breakdown.inputs.startDate ? new Date(breakdown.inputs.startDate).toLocaleString() : "N/A"}</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>End</Label>
                        <div className="qc-info-value">{breakdown.inputs.endDate ? new Date(breakdown.inputs.endDate).toLocaleString() : "N/A"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Calculations */}
                {breakdown.calculationSteps?.sectionCalculations?.map((sectionCalc: any) => (
                  <div key={sectionCalc.sectionID} className="qc-breakdown-section">
                    <h4>Section: {sectionCalc.sectionName}</h4>

                    {/* Risk Items */}
                    <div className="qc-items-breakdown">
                      <h5>Risk Items Calculation</h5>
                      <div className="qc-items-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Description</th>
                              <th>Actual Value</th>
                              <th>Rate</th>
                              <th>Formula</th>
                              <th>Premium</th>
                              <th>Discounts</th>
                              <th>Net Premium</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectionCalc.riskItemCalculations?.items?.map((item: any) => (
                              <tr key={`${item.smiCode || ''}-${item.itemNo}`}>
                                <td>{item.itemNo}</td>
                                <td>{item.itemDescription}</td>
                                <td>{formatCurrency(item.actualValue)}</td>
                                <td>{item.itemRate !== undefined ? `${item.itemRate}%` : "N/A"}</td>
                                <td className="qc-formula-cell">{item.actualPremiumFormula}</td>
                                <td>{formatCurrency(item.actualPremium)}</td>
                                <td>
                                  {item.stockDiscountAmount > 0 && (
                                    <div>Stock: {formatCurrency(item.stockDiscountAmount)}</div>
                                  )}
                                  {item.feaDiscountAmount > 0 && (
                                    <div>FEA: {formatCurrency(item.feaDiscountAmount)}</div>
                                  )}
                                </td>
                                <td className="qc-highlight">{formatCurrency(item.netPremiumAfterDiscounts)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="qc-totals-row">
                              <td colSpan={2}>
                                <strong>Section Totals</strong>
                              </td>
                              <td>
                                <strong>
                                  {formatCurrency(sectionCalc.riskItemCalculations?.totals?.totalActualValue || 0)}
                                </strong>
                              </td>
                              <td></td>
                              <td></td>
                              <td>
                                <strong>
                                  {formatCurrency(sectionCalc.riskItemCalculations?.totals?.totalSharePremium || 0)}
                                </strong>
                              </td>
                              <td></td>
                              <td className="qc-highlight">
                                <strong>
                                  {formatCurrency(
                                    sectionCalc.riskItemCalculations?.totals?.totalNetPremiumAfterDiscounts || 0,
                                  )}
                                </strong>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Section Adjustments */}
                    {sectionCalc.sectionAdjustments && (
                      <div className="qc-section-adjustments">
                        <h5>Section Adjustments</h5>
                        <div className="qc-adjustments-flow">
                          <div className="qc-adjustment-step">
                            <Label>Starting Premium</Label>
                            <div className="qc-value">{formatCurrency(sectionCalc.sectionAdjustments.startingPremium)}</div>
                          </div>
                          {sectionCalc.sectionAdjustments.discountsApplied?.map((discount: any, idx: number) => (
                            <div key={idx} className="qc-adjustment-step qc-discount">
                              <Label>{discount.name}</Label>
                              <div className="qc-value">-{formatCurrency(discount.amount)}</div>
                            </div>
                          ))}
                          {sectionCalc.sectionAdjustments.loadingsApplied?.map((loading: any, idx: number) => (
                            <div key={idx} className="qc-adjustment-step qc-loading">
                              <Label>{loading.name}</Label>
                              <div className="qc-value">+{formatCurrency(loading.amount)}</div>
                            </div>
                          ))}
                          <div className="qc-adjustment-step qc-final">
                            <Label>Final Net Premium</Label>
                            <div className="qc-value qc-highlight">
                              {formatCurrency(sectionCalc.sectionAdjustments.finalNetPremium)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pro-Rata Calculation */}
                {breakdown.calculationSteps?.proRataCalculations && (
                  <div className="qc-breakdown-section">
                    <h4>Pro-Rata Calculation</h4>
                    <div className="qc-prorata-detail">
                      <div className="qc-prorata-row">
                        <Label>Net Premium Before Pro-Rata</Label>
                        <div className="qc-value">{formatCurrency(breakdown.calculationSteps.proRataCalculations.netPremiumBeforeProRata)}</div>
                      </div>
                      <div className="qc-prorata-row">
                        <Label>Cover Days</Label>
                        <div className="qc-value">{breakdown.calculationSteps.proRataCalculations.coverDays} days</div>
                      </div>
                      <div className="qc-prorata-row">
                        <Label>Standard Days</Label>
                        <div className="qc-value">{breakdown.calculationSteps.proRataCalculations.standardDays} days</div>
                      </div>
                      <div className="qc-prorata-row">
                        <Label>Pro-Rata Factor</Label>
                        <div className="qc-value">{breakdown.calculationSteps.proRataCalculations.proRataFactor}</div>
                      </div>
                      <div className="qc-prorata-row qc-formula">
                        <Label>Formula</Label>
                        <div className="qc-value">{breakdown.calculationSteps.proRataCalculations.proRataFormula}</div>
                      </div>
                      <div className="qc-prorata-row qc-final">
                        <Label>Final Premium Due</Label>
                        <div className="qc-value qc-highlight">{formatCurrency(breakdown.calculationSteps.proRataCalculations.finalPremiumDue)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Results Summary */}
                {breakdown.finalResults && (
                  <div className="qc-breakdown-section qc-final-results">
                    <h4>Final Results Summary</h4>
                    <div className="qc-results-grid">
                      <div className="qc-result-item">
                        <Label>Total Sum Insured</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.totalSumInsured)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Total Premium</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.totalPremium)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Net Premium</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.netPremium)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Pro-Rata Premium</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.proRataPremium)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Share Sum Insured</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.shareSumInsured)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Share Premium</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.sharePremium)}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Foreign Sum Insured</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.foreignSumInsured)} {breakdown.finalResults.foreignCurrency}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Foreign Premium</Label>
                        <div className="qc-result-value">{formatCurrency(breakdown.finalResults.foreignPremium)} {breakdown.finalResults.foreignCurrency}</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Overall Premium Rate</Label>
                        <div className="qc-result-value">{breakdown.finalResults.overallPremiumRate?.toFixed(4)}%</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Effective Discount Rate</Label>
                        <div className="qc-result-value">{breakdown.finalResults.effectiveDiscountRate?.toFixed(2)}%</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Effective Loading Rate</Label>
                        <div className="qc-result-value">{breakdown.finalResults.effectiveLoadingRate?.toFixed(2)}%</div>
                      </div>
                      <div className="qc-result-item">
                        <Label>Proportion Share</Label>
                        <div className="qc-result-value">{breakdown.finalResults.proportionShare}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>              
              )
            )}
          </div>
        )}
      </div>

      {showAddSectionModal && (
        <AddSectionModal
          isOpen={showAddSectionModal}
          onClose={() => {
            setShowAddSectionModal(false)
            setEditingSectionId(null)
          }}
          onSave={handleSaveSection}
          section={editingSectionId ? (calculationBreakdown?.inputs.sectionInputs || localSections || sections).find((s) => s.location === editingSectionId) : undefined}
          productId={proposalProductId || ""}
          onCalculateFullRiskArray={handleReceiveFullRiskArray}
        />
      )}
    </div>
  )
}

export default QuoteCreator
