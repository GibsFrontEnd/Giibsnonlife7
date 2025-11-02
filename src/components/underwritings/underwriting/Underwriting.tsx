// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../../features/store"
import {
  fetchPolicies,
  setActiveTab,
  setSelectedRiskFilter,
  deletePolicy,
} from "../../../features/reducers/underwriteReducers/underwritingSlice"
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice"
import { Button } from "../../UI/new-button"
import "./Underwriting.css"

type UnderwritingProps = {
  businessId?: string | null
}

const Underwriting = ({ businessId = null }: UnderwritingProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { policies, loading, activeTab, selectedRiskFilter, pagination } = useSelector(
    (state: RootState) => state.underwritings,
  )
  const { risks } = useSelector((state: RootState) => state.risks)

  const [showRiskDropdown, setShowRiskDropdown] = useState(false)

  // On mount: load risks and initial policies. If a businessId prop exists, set it as the selected filter and fetch with it.
  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)

    // set the selected filter from incoming prop (if any)
    if (businessId) {
      dispatch(setSelectedRiskFilter(businessId))
      dispatch(fetchPolicies({ page: 1, pageSize: 50, riskClass: businessId }) as any)
    } else {
      dispatch(fetchPolicies({ page: 1, pageSize: 50, riskClass: "" }) as any)
    }
  }, [dispatch, businessId])

  // If businessId prop changes later, reflect it
  useEffect(() => {
    if (businessId !== selectedRiskFilter) {
      dispatch(setSelectedRiskFilter(businessId))
      dispatch(fetchPolicies({ page: 1, pageSize: 50, riskClass: businessId || "" }) as any)
    }
  }, [businessId, dispatch]) // intentionally only depend on businessId and dispatch

  const handleTabChange = (tab: "active" | "drafts" | "pending" | "approved") => {
    dispatch(setActiveTab(tab))
  }

  const handleRiskFilter = (riskID: string | null) => {
    dispatch(setSelectedRiskFilter(riskID))
    dispatch(fetchPolicies({ page: 1, pageSize: 50, riskClass: riskID || "" }) as any)
    setShowRiskDropdown(false)
  }

  const handleEdit = (policyNo: string) => {
    navigate(`/underwritings/edit/${policyNo}`)
  }

  const handleCalculate = (policyNo: string) => {
    navigate(`/underwritings/calculator/${policyNo}`)
  }

  const handleDelete = async (policyNo: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      dispatch(deletePolicy(policyNo) as any)
    }
  }

  const handleCreatePolicy = () => {
    if (businessId) navigate(`/underwriting/create/${businessId}`)
    else navigate("/underwritings/create")
  }

  // Filter policies by selected risk (business) and active tab
  const filterPoliciesByTab = (allPolicies: any[]) => {
    let list = [...allPolicies]

    if (selectedRiskFilter != null) {
      list = list.filter((p) => p.riskID === selectedRiskFilter)
    }

    switch (activeTab) {
      case "active":
        return list.filter((p) => p.status === "ACTIVE")
      case "drafts":
        return list.filter((p) => p.status === "DRAFT")
      case "pending":
        return list.filter((p) => p.status === "PENDING")
      case "approved":
        return list.filter((p) => p.status === "APPROVED")
      default:
        return list
    }
  }

  const filteredPolicies = filterPoliciesByTab(policies)
  const riskFilterName = risks.find((r) => r.riskID === selectedRiskFilter)?.riskName

  // counts that respect selectedRiskFilter (for tab labels)
  const countWithStatus = (status: string) =>
    policies.filter((p) => (selectedRiskFilter != null ? p.riskID === selectedRiskFilter && p.status === status : p.status === status)).length

  if (loading.fetchPolicies) {
    return <div className="uw-loading">Loading policies...</div>
  }

  return (
    <div className="uw-container">
      <div className="uw-header">
        <h1>Underwriting Management</h1>
        <button className="uw-create-policy-btn" onClick={handleCreatePolicy}>
          + Create New Policy
        </button>
      </div>

      <div className="uw-controls">
        <div className="uw-tabs-container">
          <button
            className={`uw-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => handleTabChange("active")}
          >
            Active ({countWithStatus("ACTIVE")})
          </button>
          <button
            className={`uw-tab ${activeTab === "drafts" ? "active" : ""}`}
            onClick={() => handleTabChange("drafts")}
          >
            Drafts ({countWithStatus("DRAFT")})
          </button>
          <button
            className={`uw-tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => handleTabChange("pending")}
          >
            Pending ({countWithStatus("PENDING")})
          </button>
          <button
            className={`uw-tab ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => handleTabChange("approved")}
          >
            Approved ({countWithStatus("APPROVED")})
          </button>

          <div className="uw-risk-filter-dropdown">
            <button className="uw-dropdown-trigger" onClick={() => setShowRiskDropdown(!showRiskDropdown)}>
              {riskFilterName ? `Filter: ${riskFilterName}` : "Filter by Risk"}
              <span>▼</span>
            </button>
            {showRiskDropdown && (
              <div className="uw-dropdown-menu">
                <button className="uw-dropdown-item" onClick={() => handleRiskFilter(null)}>
                  All Risks
                </button>
                {risks.map((risk) => (
                  <button key={risk.riskID} className="uw-dropdown-item" onClick={() => handleRiskFilter(risk.riskID)}>
                    {risk.riskName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredPolicies.length === 0 ? (
        <div className="uw-no-policies">
          <p>No policies found in this category</p>
        </div>
      ) : (
        <div className="uw-policies-list">
          {filteredPolicies.map((policy) => (
            <div key={policy.policyNo} className="uw-policy-card">
              <div className="uw-policy-header">
                <div className="uw-policy-main">
                  <div className="uw-policy-number">{policy.policyNo}</div>
                  <div className="uw-policy-client">
                    {policy.insSurname} {policy.insFirstname}
                  </div>
                </div>
                <div className={`uw-status-badge uw-status-${policy.status}`}>{policy.status}</div>
              </div>

              <div className="uw-policy-details">
                <div className="uw-detail-row">
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Product</div>
                    <div className="uw-detail-value">{policy.product}</div>
                  </div>
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Branch</div>
                    <div className="uw-detail-value">{policy.branch}</div>
                  </div>
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Business Source</div>
                    <div className="uw-detail-value">{policy.bizSource}</div>
                  </div>
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Effective Date</div>
                    <div className="uw-detail-value">{policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : "N/A"}</div>
                  </div>
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Expiry Date</div>
                    <div className="uw-detail-value">{policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString() : "N/A"}</div>
                  </div>
                  <div className="uw-detail-item">
                    <div className="uw-detail-label">Our Share</div>
                    <div className="uw-detail-value">{policy.ourShare}%</div>
                  </div>
                </div>
              </div>

              <div className="uw-policy-actions">
                <Button onClick={() => handleEdit(policy.policyNo)} variant="outline" size="sm">
                  Edit
                </Button>
                <Button onClick={() => handleCalculate(policy.policyNo)} variant="outline" size="sm">
                  Calculate
                </Button>
                <Button
                  onClick={() => handleDelete(policy.policyNo)}
                  variant="outline"
                  size="sm"
                  className="uw-delete-btn"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="uw-pagination">
          <span className="uw-pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  )
}

export default Underwriting
