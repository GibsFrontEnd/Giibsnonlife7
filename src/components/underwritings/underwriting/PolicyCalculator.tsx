//@ts-nocheck
"use client"
// @ts-nocheck
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../UI/new-button"
import AddPolicySectionModal from "../../Modals/AddPolicySectionModal" // adjust path
import { DUMMY_POLICIES } from "../../../features/reducers/underwriteReducers/underwritingSlice"
import type { Policy, PolicyCalculation, PolicySection } from "../../../types/underwriting"
import type { RootState } from "../../../features/store"
import { setCurrentCalculation } from "../../../features/reducers/underwriteReducers/underwritingSlice"
import "./PolicyCalculator.css" // keep your styling

/* Helper formatters (unchanged) */
const fmt = (v: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(v)

const daysBetween = (a?: string | Date, b?: string | Date) => {
  if (!a || !b) return 0
  const A = new Date(a).setHours(0, 0, 0, 0)
  const B = new Date(b).setHours(0, 0, 0, 0)
  const diff = Math.round((B - A) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : 0
}

export default function PolicyCalculator() {
  const dispatch = useDispatch()
  const { policyNo: routePolicyNo, calculationId } = useParams<{ policyNo: string; calculationId?: string }>()
  const policyNo = routePolicyNo || "P/119/2001/2025/00003"

  // store slices
  const { policies, currentPolicy, calculations, currentCalculation } = useSelector(
    (s: RootState) => s.underwritings,
  )

  // keep your DUMMY_POLICY fallback
  const policy: Policy | undefined = DUMMY_POLICIES.find((p) => p.policyNo === policyNo) || policies.find((p) => p.policyNo === policyNo)

  // determine resolvedCalculation: currentCalculation -> calculations array -> null
  const resolvedCalculation: PolicyCalculation | null = useMemo(() => {
    if (currentCalculation && String(currentCalculation.id) === String(calculationId)) return currentCalculation
    const found = calculations?.find((c) => String(c.id) === String(calculationId))
    if (found) {
      dispatch(setCurrentCalculation(found) as any) // keep store synced
      return found
    }
    return null
  }, [currentCalculation, calculations, calculationId, dispatch])

  // Optional: if you want deep-link fetching, uncomment & adapt your thunk here.
  // import { fetchCalculationById } from '...'
  // useEffect(() => {
  //   if (!resolvedCalculation && calculationId) {
  //     dispatch(fetchCalculationById({ policyNo, calculationId }) as any)
  //       .then(res => { /* handle result - setCurrentCalculation if needed */ })
  //   }
  // }, [resolvedCalculation, calculationId, policyNo, dispatch])

  // initial dates (policy or defaults)
  const today = new Date()
  const defaultEntry = (policy?.entryDate as string) ?? today.toISOString()
  const defaultStart = (policy?.effectiveDate as string) ?? today.toISOString()
  const defaultExpiry =
    (policy?.expiryDate as string) ?? new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString()

  const [entryDate, setEntryDate] = useState<string>(defaultEntry as string)
  const [startDate, setStartDate] = useState<string>(defaultStart as string)
  const [expiryDate, setExpiryDate] = useState<string>(defaultExpiry as string)
  const [coverDays, setCoverDays] = useState<number>(daysBetween(startDate, expiryDate))

  // policy fields (insure info etc) - try to prefer currentPolicy then DUMMY
  const [insuredName, setInsuredName] = useState<string>(
    (currentPolicy?.insSurname ?? policy?.insSurname ?? "") +
      (currentPolicy?.insFirstname ?? policy?.insFirstname ? ` ${(currentPolicy?.insFirstname ?? policy?.insFirstname)}` : ""),
  )
  const [insAddress, setInsAddress] = useState<string>(currentPolicy?.insAddress ?? policy?.insAddress ?? "")
  const [occupation, setOccupation] = useState<string>(currentPolicy?.insOccupation ?? (policy as any)?.insOccupation ?? "")
  const [ourShare, setOurShare] = useState<number>(currentPolicy?.ourShare ?? policy?.ourShare ?? 100)
  const [policyExcess, setPolicyExcess] = useState<number>(currentPolicy?.policyExcess ?? (policy as any)?.policyExcess ?? 0)
  const [riskLocation, setRiskLocation] = useState<string>(currentPolicy?.riskLocation ?? policy?.riskLocation ?? "")
  const [riskClassification, setRiskClassification] = useState<string>(currentPolicy?.riskClassification ?? policy?.riskClassification ?? "")

  // sections: prefer store sections (if present) else keep existing local sections (policy.sections)
  const storeSections: PolicySection[] = useSelector((s: RootState) => s.underwritings.sections ?? [])
  const initialSections = (storeSections && storeSections.length > 0)
    ? storeSections
    : (policy && (policy as any).sections && Array.isArray((policy as any).sections)
        ? (policy as any).sections.map((s: any, i: number) => ({
            sectionID: s.sectionID ?? i,
            sectionName: s.sectionName ?? `Section ${i + 1}`,
            entryDate: s.entryDate ?? entryDate,
            startDate: s.startDate ?? startDate,
            expiryDate: s.expiryDate ?? expiryDate,
            coverDays: s.coverDays ?? daysBetween(startDate, expiryDate),
            riskItems: s.riskItems ?? [],
          }))
        : []
      )

  const [sections, setSections] = useState<PolicySection[]>(initialSections)

  const [isModalOpen, setModalOpen] = useState(false)
  const [occupationError, setOccupationError] = useState<string | null>(null)

  // adjustments kept as before
  const [theftLoading, setTheftLoading] = useState<number>(resolvedCalculation?.discounts.theftLoading ?? 0)
  const [specialDisc, setSpecialDisc] = useState<number>(resolvedCalculation?.discounts.specialDiscount ?? 0)
  const [srccLoading, setSrccLoading] = useState<number>(resolvedCalculation?.discounts.srccLoading ?? 0)
  const [deductibleDisc, setDeductibleDisc] = useState<number>(resolvedCalculation?.discounts.deductibleDiscount ?? 0)
  const [otherLoading, setOtherLoading] = useState<number>(resolvedCalculation?.discounts.otherLoading ?? 0)
  const [spreadDisc, setSpreadDisc] = useState<number>(resolvedCalculation?.discounts.spreadDiscount ?? 0)
  const [ltaDisc, setLtaDisc] = useState<number>(resolvedCalculation?.discounts.ltaDiscount ?? 0)

  // If a calculation is resolved, populate summary values from it (so page shows calculation results)
  const calculationSummary = useMemo(() => {
    if (!resolvedCalculation) return null
    const c: PolicyCalculation = resolvedCalculation
    return {
      totalSumInsured: c.totalSumInsured ?? 0,
      totalPremium: c.totalPremium ?? 0,
      shareSumInsured: c.shareSumInsured ?? 0,
      sharePremium: c.sharePremium ?? 0,
      netPremiumDue: c.netPremiumDue ?? c.netPremium ?? 0,
      currencyType: c.currencyType ?? "NGN",
      coverDays: c.coverDays ?? daysBetween(startDate, expiryDate),
      createdBy: c.createdBy,
      createdOn: c.createdOn,
      discounts: c.discounts ?? {},
    }
  }, [resolvedCalculation, startDate, expiryDate])

  // local totals computed from sections (unchanged behavior)
  const totalsFromSections = useMemo(() => {
    const aggregate = sections.reduce(
      (acc, s) => {
        (s.riskItems || []).forEach((it: any) => {
          const si = Number(it.sumInsured) || 0
          const prem = Number(it.premium) || 0
          acc.totalSI += si
          acc.totalPremium += prem
          acc.itemShareSI += (si * (ourShare / 100))
          acc.itemSharePremium += (prem * (ourShare / 100))
        })
        return acc
      },
      { totalSI: 0, totalPremium: 0, itemShareSI: 0, itemSharePremium: 0 },
    )

    const totalLoadings = (theftLoading + srccLoading + otherLoading) / 100
    const totalDiscounts = (specialDisc + deductibleDisc + spreadDisc + ltaDisc) / 100

    const loadingAmount = totalsSafe(aggregate.totalPremium * totalLoadings)
    const discountAmount = totalsSafe(aggregate.totalPremium * totalDiscounts)
    const premiumAfterAdjust = totalsSafe(aggregate.totalPremium + loadingAmount - discountAmount)
    const prorata = totalsSafe((coverDays / 365) * premiumAfterAdjust)

    return {
      aggregateSI: totalsSafe(aggregate.totalSI),
      aggregatePremium: totalsSafe(aggregate.totalPremium),
      itemShareSI: totalsSafe(aggregate.itemShareSI),
      itemSharePremium: totalsSafe(aggregate.itemSharePremium),
      loadingAmount,
      discountAmount,
      premiumAfterAdjust,
      prorata,
    }
  }, [
    sections,
    ourShare,
    theftLoading,
    specialDisc,
    srccLoading,
    deductibleDisc,
    otherLoading,
    spreadDisc,
    ltaDisc,
    coverDays,
  ])

  function totalsSafe(v: number) {
    if (!isFinite(v) || Number.isNaN(v)) return 0
    return Math.round((v + Number.EPSILON) * 100) / 100
  }

  // keep the cover days behaviour
  const handleGetCoverDays = () => {
    const d = daysBetween(startDate, expiryDate)
    setCoverDays(d)
  }

  // modal / sections handlers unchanged
  const handleOpenAddSection = () => setModalOpen(true)
  const handleCloseAddSection = () => setModalOpen(false)

  const handleSaveSections = (newSections: any[]) => {
    const normalized = newSections.map((s, idx) => ({
      sectionID: s.sectionID ?? `tmp-${Date.now()}-${idx}`,
      sectionName: s.sectionName ?? `Section ${sections.length + idx + 1}`,
      riskItems: (s.riskItems || []).map((it: any, ii: number) => {
        const sumInsured = Number(it.sumInsured) || 0
        const rate = Number(it.rate) || 0
        const multiplier = Number(it.multiplier) || 1
        const premium = totalsSafe((sumInsured * rate * multiplier) / 100)
        return { ...it, itemNo: it.itemNo ?? ii + 1, sumInsured, rate, multiplier, premium }
      }),
    }))
    setSections((prev) => [...prev, ...normalized])
    setModalOpen(false)
  }

  const handleRemoveSection = (id: string | number) => {
    setSections((prev) => prev.filter((s) => s.sectionID !== id))
  }

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleExpanded = (id: string | number) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  useEffect(() => {
    if (!occupation || occupation.trim() === "") setOccupationError("The Occupation of the Insured can not be empty. Please select from the drop down")
    else setOccupationError(null)
  }, [occupation])

  // When a resolved calculation appears, prefill some UI fields so user sees its results immediately
  useEffect(() => {
    if (!resolvedCalculation) return

    // If calculation has coverDays, respect it; else compute from dates
    const c = resolvedCalculation
    if (c.coverDays) setCoverDays(c.coverDays)
    if (c.createdOn) {
      // optional: set entry/start/expiry around createdOn if you want — keeping current behaviour
    }

    // prefer calculation summary for displayed totals (so summary shows saved results)
    if (c.currencyType) {
      // if calculation provides currency/premiums, we can use them in the UI summary
      // (we keep sections behavior unchanged — sections still editable)
    }

    // ensure store currentCalculation is set (already done in resolver, but safe)
    dispatch(setCurrentCalculation(c) as any)
  }, [resolvedCalculation, dispatch])

  // choose what summary to display: resolvedCalculation summary (if present) else recomputed from sections
  const displaySummary = calculationSummary ?? {
    totalSumInsured: totalsFromSections.aggregateSI,
    totalPremium: totalsFromSections.aggregatePremium,
    shareSumInsured: totalsFromSections.itemShareSI,
    sharePremium: totalsFromSections.itemSharePremium,
    netPremiumDue: totalsFromSections.prorata,
    currencyType: policy?.exCurrency ?? "NGN",
    coverDays,
  }

  // UI early return when policy not found (keeps your original)
  if (!policy) {
    return (
      <div className="policy-calc-notfound">
        <h3>Policy not found</h3>
        <p>Using policyNo: {policyNo}</p>
      </div>
    )
  }

  return (
    <div className="policy-calculator">
      <div className="pc-header">
        <h2>Policy Calculator</h2>
        <div className="pc-dates">
          <label>
            Entry Date:
            <input type="date" value={formatForInput(entryDate)} onChange={(e) => setEntryDate(e.target.value)} />
          </label>
          <label>
            Start Date:
            <input type="date" value={formatForInput(startDate)} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Expiry Date:
            <input type="date" value={formatForInput(expiryDate)} onChange={(e) => setExpiryDate(e.target.value)} />
          </label>
          <Button onClick={handleGetCoverDays}>Get Cover Days ({coverDays})</Button>
        </div>
      </div>

      <div className="pc-policy-info">
        <div>
          <strong>Policy No</strong>: {policy.policyNo}
        </div>
        <div>
          <strong>Insured</strong>: {insuredName}
        </div>
        <div>
          <strong>Address</strong>: {insAddress}
        </div>
        <div>
          <strong>Occupation</strong>:
          <select value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="">- select -</option>
            <option>Broadcasting Stations</option>
            <option>Electrical</option>
            <option>Food Processing</option>
            <option>Residential</option>
            <option>Office</option>
            <option>Other</option>
          </select>
          {occupationError && <div className="pc-error">{occupationError} <button onClick={() => setOccupation("")}>close</button></div>}
        </div>

        <div>
          <strong>Our Share:</strong>
          <input type="number" value={ourShare} onChange={(e) => setOurShare(Number(e.target.value) || 0)} min={0} max={100} /> %
        </div>

        <div>
          <strong>Policy Excess:</strong> <input type="number" value={policyExcess} onChange={(e) => setPolicyExcess(Number(e.target.value) || 0)} />
        </div>

        <div>
          <strong>Risk Location:</strong> <input value={riskLocation} onChange={(e) => setRiskLocation(e.target.value)} />
        </div>

        <div>
          <strong>Risk Classification:</strong>
          <select value={riskClassification} onChange={(e) => setRiskClassification(e.target.value)}>
            <option value="">- select -</option>
            <option>RESIDENTIAL</option>
            <option>ELECTRICAL</option>
            <option>FOOD</option>
            <option>OTHER</option>
          </select>
        </div>
      </div>

      <div className="pc-sections">
        <div className="pc-sections-header">
          <h3>Sections ({sections.length})</h3>
          <div>
            <Button onClick={handleOpenAddSection}>Add Section</Button>
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="pc-no-sections">No sections yet — add one to begin</div>
        ) : (
          sections.map((s) => {
            const secSum = s.riskItems.reduce((a: number, it: any) => a + (Number(it.sumInsured) || 0), 0)
            const secPrem = s.riskItems.reduce((a: number, it: any) => a + (Number(it.premium) || 0), 0)
            const secOurSI = secSum * (ourShare / 100)
            const secOurPrem = secPrem * (ourShare / 100)
            return (
              <div className="pc-section-card" key={s.sectionID}>
                <div className="pc-section-header">
                  <button onClick={() => toggleExpanded(s.sectionID)} className="pc-expand-btn">
                    {expanded[s.sectionID] ? "▾" : "▸"}
                  </button>
                  <strong>{s.sectionName}</strong>
                  <span className="pc-section-meta">{s.riskItems.length} items</span>
                  <span className="pc-section-meta">SI: {fmt(secSum)}</span>
                  <span className="pc-section-meta">Premium: {fmt(secPrem)}</span>
                  <span className="pc-section-meta">Our SI: {fmt(secOurSI)}</span>
                  <span className="pc-section-meta">Our Premium: {fmt(secOurPrem)}</span>
                  <Button variant="outline" onClick={() => handleRemoveSection(s.sectionID)}>Remove</Button>
                </div>

                {expanded[s.sectionID] && (
                  <div className="pc-section-body">
                    <table className="pc-items-table">
                      <thead>
                        <tr>
                          <th>Item No</th>
                          <th>SMI</th>
                          <th>Description</th>
                          <th>SumInsured</th>
                          <th>Rate</th>
                          <th>Multiplier</th>
                          <th>Premium</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.riskItems.map((it, idx) => (
                          <tr key={idx}>
                            <td>{it.itemNo}</td>
                            <td>{it.smiCode || "-"}</td>
                            <td>{it.itemDescription || "-"}</td>
                            <td>{fmt(Number(it.sumInsured) || 0)}</td>
                            <td>{Number(it.rate) || 0}%</td>
                            <td>{Number(it.multiplier) || 1}</td>
                            <td>{fmt(Number(it.premium) || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="pc-premium-details">
        <h3>Premium Details</h3>

        {/* prefer displaySummary from calculation if it exists, else computed totals */}
        <div className="pd-row">
          <div>Aggregate SumInsured:</div>
          <div>{fmt(displaySummary.totalSumInsured)}</div>
        </div>
        <div className="pd-row">
          <div>Aggregate Premium:</div>
          <div>{fmt(displaySummary.totalPremium)}</div>
        </div>

        <div className="pd-grid">
          <label> Theft Loading (%) <input type="number" value={theftLoading} onChange={(e) => setTheftLoading(Number(e.target.value) || 0)} /></label>
          <label> Special Disc (%) <input type="number" value={specialDisc} onChange={(e) => setSpecialDisc(Number(e.target.value) || 0)} /></label>
          <label> SRCC Loading (%) <input type="number" value={srccLoading} onChange={(e) => setSrccLoading(Number(e.target.value) || 0)} /></label>
          <label> Deductible Disc (%) <input type="number" value={deductibleDisc} onChange={(e) => setDeductibleDisc(Number(e.target.value) || 0)} /></label>
          <label> Other Loading (%) <input type="number" value={otherLoading} onChange={(e) => setOtherLoading(Number(e.target.value) || 0)} /></label>
          <label> Spread Disc (%) <input type="number" value={spreadDisc} onChange={(e) => setSpreadDisc(Number(e.target.value) || 0)} /></label>
          <label> LTA Disc (%) <input type="number" value={ltaDisc} onChange={(e) => setLtaDisc(Number(e.target.value) || 0)} /></label>
        </div>

        <div className="pd-row">
          <div>Loading Amount:</div>
          <div>{fmt(totalsFromSections.loadingAmount)}</div>
        </div>
        <div className="pd-row">
          <div>Discount Amount:</div>
          <div>{fmt(totalsFromSections.discountAmount)}</div>
        </div>
        <div className="pd-row">
          <div>Premium After Adjust:</div>
          <div>{fmt(totalsFromSections.premiumAfterAdjust)}</div>
        </div>
        <div className="pd-row">
          <div>Pro-Rata Premium (cover days)</div>
          <div>{fmt(displaySummary.netPremiumDue)}</div>
        </div>
      </div>

      <AddPolicySectionModal
        isOpen={isModalOpen}
        policyNo={policy.policyNo}
        onClose={handleCloseAddSection}
        onSave={handleSaveSections}
      />
    </div>
  )
}

// helper to format ISO / Date -> YYYY-MM-DD for <input type=date>
function formatForInput(d: string | Date | undefined) {
  if (!d) return ""
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ""
  const iso = dt.toISOString().slice(0, 10)
  return iso
}
