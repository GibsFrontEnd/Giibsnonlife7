"use client"

//@ts-nocheck

import { Filter, Search } from "lucide-react"

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

import { Input as NewInput } from "../../UI/new-input"

import Input from "../../UI/Input"

import "./Quotations.css"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../UI/collapsible"

import { Checkbox } from "../../UI/checkbox"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../UI/new-select"

type QuotationsProps = {
  businessId: string | null
}

const Quotations = ({ businessId }: QuotationsProps) => {
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const { proposals, loading, error, searchTerm, activeTab, selectedRiskFilter, pagination } = useSelector(
    (state: RootState) => state.quotations,
  )

  const { risks } = useSelector((state: RootState) => state.risks)

  const [showRiskDropdown, setShowRiskDropdown] = useState(false)

  const [searchFilter, setSearchFilter] = useState(false)

  const [filterCriteria, setFilterCriteria] = useState({
    searchField: "fullName",

    searchValue: "",

    startDate: "",

    endDate: "",

    status: "all",

    coverCode: "",
  })

  const [filteredQuotations, setFilteredQuotations] = useState<any>(null)

  const clearFilters = () => {
    setFilterCriteria({
      searchField: "fullName",

      searchValue: "",

      startDate: "",

      endDate: "",

      status: "all",

      coverCode: "",
    })

    setFilteredQuotations(null)
  }

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

  useEffect(() => {
    dispatch(setSelectedRiskFilter(businessId))
  }, [])

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
      safeLower(proposal.proposalNo || "").includes(searchTerm.toLowerCase()) ||
      safeLower(proposal.insSurname || "").includes(searchTerm.toLowerCase())

    if (selectedRiskFilter != null) {
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
    } else {
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

  const applyFilters = () => {
    const tabFilteredQuotations = filteredProposals
    if (!tabFilteredQuotations || tabFilteredQuotations.length === 0) {
      setFilteredQuotations({
        items: [],
        totalCount: 0,
      })
      return
    }

    let filtered = [...tabFilteredQuotations]

    if (filterCriteria.searchValue.trim()) {
      filtered = filtered.filter((quote) => {
        const searchValue = filterCriteria.searchValue.toLowerCase()
        switch (filterCriteria.searchField) {
          case "fullName":
            const fullName = `${quote.insSurname || ""} ${quote.insFirstname || ""}`.toLowerCase()
            return fullName.includes(searchValue)
          case "quoteNo":
            return quote.insOthernames?.toLowerCase().includes(searchValue)
          case "proposalNo":
            return quote.proposalNo?.toLowerCase().includes(searchValue)
          case "coverCode":
            return quote.insMobilePhone?.toLowerCase().includes(searchValue)
          default:
            return true
        }
      })
    }

    if (filterCriteria.startDate) {
      filtered = filtered.filter((quote) => {
        const quoteDate = new Date(quote.startDate)
        const startDate = new Date(filterCriteria.startDate)
        return quoteDate >= startDate
      })
    }

    if (filterCriteria.endDate) {
      filtered = filtered.filter((quote) => {
        const quoteDate = new Date(quote.startDate)
        const endDate = new Date(filterCriteria.endDate)
        return quoteDate <= endDate
      })
    }

    if (filterCriteria.status !== "all") {
      filtered = filtered.filter((quote) => quote.transSTATUS?.toLowerCase() === filterCriteria.status.toUpperCase())
    }

    if (filterCriteria.coverCode.trim()) {
      filtered = filtered.filter((quote) =>
        quote.companyID?.toLowerCase().includes(filterCriteria.coverCode.toLowerCase()),
      )
    }

    setFilteredQuotations({
      items: filtered,
      totalCount: filtered.length,
    })
  }

  useEffect(() => {
    setFilteredQuotations(null)
  }, [activeTab, searchTerm, selectedRiskFilter, proposals])

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
        <Collapsible open={searchFilter} onOpenChange={setSearchFilter}>
          <div className="border rounded-lg mb-6 bg-gray-50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />

                  <span className="text-sm font-medium">Search Filter</span>
                </div>

                <Checkbox checked={searchFilter} />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-1">
                    <label className="text-sm text-gray-600 mb-1 block">Search by</label>

                    <Select
                      value={filterCriteria.searchField}
                      onValueChange={(value) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          searchField: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="fullName">Client Name</SelectItem>

                        {/* <SelectItem value="quoteNo">Quote Number</SelectItem> */}

                        <SelectItem value="proposalNo">Proposal Number</SelectItem>

                        {/* <SelectItem value="coverCode">Cover Code</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="text-sm text-gray-600 mb-1 block">Search text</label>

                    <NewInput
                      value={filterCriteria.searchValue}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          searchValue: e.target.value,
                        }))
                      }
                      placeholder="Enter search text"
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <label className="text-sm text-gray-600 mb-1 block">Start Date</label>

                    <NewInput
                      type="date"
                      value={filterCriteria.startDate}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <label className="text-sm text-gray-600 mb-1 block">End Date</label>

                    <NewInput
                      type="date"
                      value={filterCriteria.endDate}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="lg:col-span-1 flex items-end">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={applyFilters}>
                      <Search className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {/* <div>
                    <label className="text-sm text-gray-600 mb-1 block">Status</label>

                    <Select
                      value={filterCriteria.status}
                      onValueChange={(value) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>

                        <SelectItem value="draft">Draft</SelectItem>

                        <SelectItem value="active">Active</SelectItem>

                        <SelectItem value="pending">Pending</SelectItem>

                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Cover Code</label>

                    <Input
                      value={filterCriteria.coverCode}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,

                          coverCode: e.target.value,
                        }))
                      }
                      placeholder="Enter cover code"
                    />
                  </div> */}

                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="qtns-tabs-container">
          <button
            className={`qtns-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview (
            {proposals.filter((p) => (selectedRiskFilter != null ? selectedRiskFilter == p.riskID : p)).length})
          </button>

          <button
            className={`qtns-tab ${activeTab === "drafts" ? "active" : ""}`}
            onClick={() => handleTabChange("drafts")}
          >
            Drafts (
            {
              proposals.filter((p) =>
                selectedRiskFilter != null
                  ? p.transSTATUS === "PENDING" && selectedRiskFilter == p.riskID
                  : p.transSTATUS === "PENDING",
              ).length
            }
            )
          </button>

          <button
            className={`qtns-tab ${activeTab === "calculated" ? "active" : ""}`}
            onClick={() => handleTabChange("calculated")}
          >
            Calculated (
            {
              proposals.filter((p) =>
                selectedRiskFilter != null
                  ? p.transSTATUS === "CALCULATED" && selectedRiskFilter == p.riskID
                  : p.transSTATUS === "CALCULATED",
              ).length
            }
            )
          </button>

          <button
            className={`qtns-tab ${activeTab === "converted" ? "active" : ""}`}
            onClick={() => handleTabChange("converted")}
          >
            Converted (
            {
              proposals.filter((p) =>
                selectedRiskFilter != null
                  ? p.transSTATUS === "CONVERTED" && selectedRiskFilter == p.riskID
                  : p.transSTATUS === "CONVERTED",
              ).length
            }
            )
          </button>
        </div>
      </div>

      <div className="qtns-proposals-list">
        {(filteredQuotations?.items || filteredProposals).length === 0 ? (
          <div className="qtns-no-proposals">
            <p>No proposals found.</p>

            <Button onClick={handleCreateProposal}>Create Your First Proposal</Button>
          </div>
        ) : (
          (filteredQuotations?.items || filteredProposals).map((proposal: any) => (
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

                    <span className="qtns-detail-value">
                      {risks.find((r) => r.riskID == proposal.riskID)?.riskName}
                    </span>
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

      <div className="qtns-pagination">
        {/* @ts-ignore */}
        <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrevious} size="sm">
          Previous
        </Button>

        <span className="qtns-pagination-info">
          {filteredQuotations ? (
            <>Showing {filteredQuotations.totalCount} filtered results</>
          ) : (
            <>
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
            </>
          )}
        </span>

        {/* @ts-ignore */}
        <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}

export default Quotations
