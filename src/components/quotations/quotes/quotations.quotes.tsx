"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../../features/store"
import {
  fetchProposals,
  setSearchTerm,
  setActiveTab,
  setSelectedRiskFilter,
  deleteProposal,
} from "../../../features/reducers/quoteReducers/quotationSlice"
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice"
import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import "./Quotations.css"

const Quotations = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { proposals, loading, error, searchTerm, activeTab, selectedRiskFilter, pagination } = useSelector(
    (state: RootState) => state.quotations,
  )
  const { risks } = useSelector((state: RootState) => state.risks)

  const [showRiskDropdown, setShowRiskDropdown] = useState(false)

  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)
  }, [dispatch])

  useEffect(() => {
    dispatch(
      fetchProposals({
        page: pagination.page,
        pageSize: pagination.pageSize,
        riskClass: "",
      }) as any,
    )
  }, [dispatch, pagination.page, pagination.pageSize, selectedRiskFilter])

  const handleSearch = (value: string) => {
    dispatch(setSearchTerm(value))
  }

  const handleTabChange = (tab: "overview" | "drafts" | "calculated" | "converted") => {
    dispatch(setActiveTab(tab))
  }

  const handleRiskFilter = (riskID: string | null) => {
    dispatch(setSelectedRiskFilter(riskID))
    setShowRiskDropdown(false)
  }

  const handleCreateProposal = () => {
    navigate("/quotations/create")
  }

  const handleEditProposal = (proposalNo: string) => {
    navigate(`/quotations/edit/${proposalNo}`)
  }

  const handleDeleteProposal = (proposalNo: string) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      dispatch(deleteProposal(proposalNo) as any)
    }
  }

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchProposals({
        page: newPage,
        pageSize: pagination.pageSize,
        riskClass: selectedRiskFilter || "",
      }) as any,
    )
  }

  const filteredProposals = proposals.filter((proposal) => {
    const safeLower = (val?: string) => val?.toLowerCase() ?? ""
    const matchesSearch =
      safeLower((proposal.proposalNo || "")).includes(searchTerm.toLowerCase()) ||
      safeLower((proposal.insSurname) || "").includes(searchTerm.toLowerCase())

      if(selectedRiskFilter != null){  
        switch (activeTab) {
        case "drafts":
          return matchesSearch && selectedRiskFilter == proposal.riskID && proposal.transSTATUS === "PENDING"
        case "calculated":
          return matchesSearch && selectedRiskFilter == proposal.riskID && proposal.transSTATUS === "CALCULATED"
        case "converted":
          return matchesSearch && selectedRiskFilter == proposal.riskID && proposal.transSTATUS === "CONVERTED"
        default:
          return matchesSearch && selectedRiskFilter == proposal.riskID 
      }
    }
      else{
    switch (activeTab) {
      case "drafts":
        return matchesSearch && proposal.transSTATUS === "PENDING"
      case "calculated":
        return matchesSearch && proposal.transSTATUS === "CALCULATED"
      case "converted":
        return matchesSearch && proposal.transSTATUS === "CONVERTED"
      default:
        return matchesSearch
    }
  }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: "qtns-status-pending",
      CALCULATED: "qtns-status-calculated",
      CONVERTED: "qtns-status-converted",
    }
    return (
      <span className={`qtns-status-badge ${statusClasses[status as keyof typeof statusClasses] || ""}`}>{status}</span>
    )
  }

  if (loading.fetchProposals) {
    return <div className="qtns-loading">Loading quotations...</div>
  }

  if (error.fetchProposals) {
    return <div className="qtns-error">Error: {error.fetchProposals}</div>
  }

  return (
    <div className="qtns-container">
      <div className="qtns-header">
        <h1>Quotations Management</h1>
        <Button onClick={handleCreateProposal} className="qtns-create-proposal-btn">
          Create New Quotation
        </Button>
      </div>

      <div className="qtns-controls">
        <div className="qtns-search-container">
          <Input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="qtns-search-input"
          />
        </div>

        <div className="qtns-tabs-container">
            <button
              className={`qtns-tab qtns-dropdown-trigger ${selectedRiskFilter ? "active" : ""}`}
              onClick={() => setShowRiskDropdown(!showRiskDropdown)}
            >
              {selectedRiskFilter
                ? risks.find((r) => r.riskName === selectedRiskFilter)?.riskName || "Business Filter"
                : "Business Filter"}{" "}
              ▼
            </button>
            {showRiskDropdown && (
              <div className="qtns-dropdown-menu">
                <button className="qtns-dropdown-item" onClick={() => handleRiskFilter(null)}>
                  All Businesses
                </button>
                {risks.map((risk) => (
                  <button
                    key={risk.riskID}
                    className="qtns-dropdown-item"
                    onClick={() => handleRiskFilter(risk.riskID)}
                  >
                    {risk.riskName}
                  </button>
                ))}
              </div>
            )}

          <button
            className={`qtns-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview ({proposals.filter((p) => selectedRiskFilter != null ? selectedRiskFilter == p.riskID :p).length})
          </button>
          <button
            className={`qtns-tab ${activeTab === "drafts" ? "active" : ""}`}
            onClick={() => handleTabChange("drafts")}
          >
            Drafts ({proposals.filter((p) => selectedRiskFilter != null ? p.transSTATUS === "PENDING" && selectedRiskFilter == p.riskID :p.transSTATUS === "PENDING").length})
          </button>
          <button
            className={`qtns-tab ${activeTab === "calculated" ? "active" : ""}`}
            onClick={() => handleTabChange("calculated")}
          >
            Calculated ({proposals.filter((p) => selectedRiskFilter != null ? p.transSTATUS === "CALCULATED" && selectedRiskFilter == p.riskID :p.transSTATUS === "CALCULATED").length})
          </button>
          <button
            className={`qtns-tab ${activeTab === "converted" ? "active" : ""}`}
            onClick={() => handleTabChange("converted")}
          >
            Converted ({proposals.filter((p) => selectedRiskFilter != null ? p.transSTATUS === "CONVERTED" && selectedRiskFilter == p.riskID :p.transSTATUS === "CONVERTED").length})
          </button>

        </div>
      </div>

      <div className="qtns-proposals-list">
        {filteredProposals.length === 0 ? (
          <div className="qtns-no-proposals">
            <p>No proposals found.</p>
            <Button onClick={handleCreateProposal}>Create Your First Proposal</Button>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <div key={proposal.proposalNo} className="qtns-proposal-card">
              <div className="qtns-proposal-header">
                <div className="qtns-proposal-main">
                  <div className="qtns-proposal-number">{proposal.proposalNo}</div>
                  <div className="qtns-proposal-client">
                    {proposal.insSurname} {proposal.insFirstname}
                  </div>
                  {getStatusBadge(proposal.transSTATUS)}
                </div>
                <div className="qtns-proposal-actions">
                  <Button onClick={() => handleEditProposal(proposal.proposalNo)} variant="outline" size="sm">
                    View/Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteProposal(proposal.proposalNo)}
                    variant="outline"
                    size="sm"
                    className="qtns-delete-btn"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="qtns-proposal-details">
                <div className="qtns-detail-row">
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">Business</span>
                    <span className="qtns-detail-value">{risks.find((r)=> r.riskID == proposal.riskID)?.riskName}</span>
                  </div>
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">Subclass</span>
                    <span className="qtns-detail-value">{proposal.subRisk}</span>
                  </div>
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">Branch</span>
                    <span className="qtns-detail-value">{proposal.branch}</span>
                  </div>
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">Agent</span>
                    <span className="qtns-detail-value">{proposal.party}</span>
                  </div>
                </div>

                <div className="qtns-detail-row">
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">Start Date</span>
                    <span className="qtns-detail-value">{formatDate(proposal.startDate)}</span>
                  </div>
                  <div className="qtns-detail-item">
                    <span className="qtns-detail-label">End Date</span>
                    <span className="qtns-detail-value">{formatDate(proposal.endDate)}</span>
                  </div>
                  <div className="qtns-detail-item qtns-premium">
                    <span className="qtns-detail-label">Premium</span>
                    <span className="qtns-detail-value qtns-premium-amount">
                      {proposal.grossPremium
                        ? new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(proposal.grossPremium)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="qtns-pagination">
        <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrevious} size="sm">
          Previous
        </Button>
        <span className="qtns-pagination-info">
          Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
        </span>
        <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}

export default Quotations
