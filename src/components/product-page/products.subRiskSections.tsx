"use client"

import { useEffect, useState } from "react"
import { Button } from "../UI/new-button"
import { useAppDispatch, useAppSelector } from "../../hooks/use-apps"
import ConfirmationModal from "../Modals/ConfirmationModal"
import SearchBar from "../SearchBar"
import {
  clearMessages,
  deleteSubRiskSection,
  getAllSubRiskSections,
  getActiveSubRiskSections,
  getSubRiskSectionsBySectionCode,
  getSubRiskSectionsBySubRisk,
  checkSubRiskSectionExists,
  selectSubRiskSections,
} from "../../features/reducers/productReducers/subRiskSectionSlice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../UI/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../UI/pagination"
import {
  selectUiState,
  setShowCreateSubRiskSectionDialog,
  setShowDeleteSubRiskSectionDialog,
  setShowEditSubRiskSectionDialog,
} from "../../features/reducers/uiReducers/uiSlice"
import type { SubRiskSection } from "../../types/subRiskSection"
import { CreateSubRiskSection, EditSubRiskSection } from "../components.subRiskSections"
import "./ProductsSubRiskSections.css"

const ProductsSubRiskSections = () => {
  const dispatch = useAppDispatch()

  const { subRiskSections, success, loading, error, exists } = useAppSelector(selectSubRiskSections)
  const { showDeleteSubRiskSectionDialog } = useAppSelector(selectUiState)

  const [subRiskSectionToEdit, setSubRiskSectionToEdit] = useState<SubRiskSection | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "active" | "sectionCode" | "subRisk">("all")
  const [filterValue, setFilterValue] = useState("")

  const filteredSubRiskSections = subRiskSections.filter(
    (section) =>
      section.sectionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.subRiskID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.subRiskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.field1?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const totalPages = Math.ceil(filteredSubRiskSections.length / rowsPerPage)

  const [sectionIdToDelete, setSectionIdToDelete] = useState<number | null>(null)
  const [sectionIdToCheck, setSectionIdToCheck] = useState<number | null>(null)

  const currentData = filteredSubRiskSections.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  useEffect(() => {
    dispatch(getAllSubRiskSections())
  }, [dispatch])

  const handleFilterChange = (type: "all" | "active" | "sectionCode" | "subRisk") => {
    setFilterType(type)
    setCurrentPage(1)

    switch (type) {
      case "all":
        dispatch(getAllSubRiskSections())
        break
      case "active":
        dispatch(getActiveSubRiskSections())
        break
      case "sectionCode":
        if (filterValue) {
          dispatch(getSubRiskSectionsBySectionCode(filterValue))
        }
        break
      case "subRisk":
        if (filterValue) {
          dispatch(getSubRiskSectionsBySubRisk(filterValue))
        }
        break
    }
  }

  const handleFilterValueSubmit = () => {
    if (filterType === "sectionCode" && filterValue) {
      dispatch(getSubRiskSectionsBySectionCode(filterValue))
    } else if (filterType === "subRisk" && filterValue) {
      dispatch(getSubRiskSectionsBySubRisk(filterValue))
    }
  }

  const handleCheckExists = (sectionId: number) => {
    setSectionIdToCheck(sectionId)
    dispatch(checkSubRiskSectionExists(sectionId))
  }

  const confirmDeleteSubRiskSection = async (sectionId: number | null) => {
    if (!sectionId) {
      console.log("No Section Id")
      return
    }

    dispatch(deleteSubRiskSection(sectionId))

    if (success.deleteSubRiskSection) {
      dispatch(clearMessages())
      setSectionIdToDelete(null)
      dispatch(setShowDeleteSubRiskSectionDialog(false))
    } else if (error.deleteSubRiskSection) {
      console.log(error)
    }
  }

  if (error.getAllSubRiskSections) {
    console.error("Error fetching Sub Risk Sections:", error)
  }

  return (
    <div className="sub-risk-sections-container">
      <div className="sub-risk-sections-header">
        <SearchBar
          placeholder="Search by section code, name, sub risk ID, sub risk name, or field..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Sections</option>
            <option value="active">Active Only</option>
            <option value="sectionCode">By Section Code</option>
            <option value="subRisk">By Sub Risk</option>
          </select>

          {(filterType === "sectionCode" || filterType === "subRisk") && (
            <div className="filter-input-group">
              <input
                type="text"
                placeholder={`Enter ${filterType === "sectionCode" ? "section code" : "sub risk ID"}...`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="filter-input"
              />
              <Button onClick={handleFilterValueSubmit} className="filter-submit-btn">
                Filter
              </Button>
            </div>
          )}
        </div>

        <Button className="add-sub-risk-section-btn" onClick={() => dispatch(setShowCreateSubRiskSectionDialog(true))}>
          Add New Sub Risk Section
        </Button>
      </div>

      {exists !== null && sectionIdToCheck && (
        <div className={`exists-indicator ${exists ? "exists-true" : "exists-false"}`}>
          Section ID {sectionIdToCheck} {exists ? "exists" : "does not exist"}
        </div>
      )}

      {loading.getAllSubRiskSections ||
      loading.getActiveSubRiskSections ||
      loading.getSubRiskSectionsBySectionCode ||
      loading.getSubRiskSectionsBySubRisk ? (
        <div className="loading-container">Loading...</div>
      ) : (
        <div className="table-container">
          <Table className="sub-risk-sections-table">
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead>Section ID</TableHead>
                <TableHead>Section Code</TableHead>
                <TableHead>Sub Risk ID</TableHead>
                <TableHead>Section Name</TableHead>
                <TableHead>Sub Risk Name</TableHead>
                <TableHead>Field1</TableHead>
                <TableHead>Field2</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>A1-A5</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="table-body">
              {currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="no-data-cell">
                    No sub risk sections found
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((section, index) => (
                  <TableRow key={section.sectionID}>
                    <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell className="section-id-cell">{section.sectionID}</TableCell>
                    <TableCell className="section-code-cell">{section.sectionCode}</TableCell>
                    <TableCell className="sub-risk-id-cell">{section.subRiskID}</TableCell>
                    <TableCell className="section-name-cell">{section.sectionName}</TableCell>
                    <TableCell className="sub-risk-name-cell">{section.subRiskName}</TableCell>
                    <TableCell className="field-cell">{section.field1}</TableCell>
                    <TableCell className="field-cell">{section.field2 || "-"}</TableCell>
                    <TableCell className="rates-cell">{section.rates ?? "-"}</TableCell>
                    <TableCell className="a-values-cell">
                      <div className="a-values-grid">
                        <span>A1: {section.a1 ?? "-"}</span>
                        <span>A2: {section.a2 ?? "-"}</span>
                        <span>A3: {section.a3 ?? "-"}</span>
                        <span>A4: {section.a4 ?? "-"}</span>
                        <span>A5: {section.a5 ?? "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="active-cell">
                      <span className={`status-badge ${section.active === 1 ? "active" : "inactive"}`}>
                        {section.active === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="submitted-by-cell">{section.submittedBy || "-"}</TableCell>
                    <TableCell className="actions-cell">
                      <Button className="check-btn" onClick={() => handleCheckExists(section.sectionID)}>
                        Check
                      </Button>
                      <Button
                        className="edit-btn"
                        onClick={() => {
                          setSubRiskSectionToEdit(section)
                          dispatch(setShowEditSubRiskSectionDialog(true))
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="delete-btn"
                        onClick={() => {
                          setSectionIdToDelete(section.sectionID)
                          dispatch(setShowDeleteSubRiskSectionDialog(true))
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="pagination-container">
            <div className="pagination-info">
              Showing{" "}
              <span className="pagination-numbers">
                {filteredSubRiskSections.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                      currentPage * rowsPerPage,
                      filteredSubRiskSections.length,
                    )} of ${filteredSubRiskSections.length}`
                  : "0 to 0 of 0"}
              </span>{" "}
              Sub Risk Sections
            </div>

            <Pagination className="pagination-controls">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="pagination-prev"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1} className="pagination-item">
                    <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className="pagination-next"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      <CreateSubRiskSection />
      <EditSubRiskSection subRiskSection={subRiskSectionToEdit} />

      {showDeleteSubRiskSectionDialog && (
        <ConfirmationModal
          title="Delete Sub Risk Section"
          message="Are you sure you want to delete this sub risk section? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => confirmDeleteSubRiskSection(sectionIdToDelete)}
          onCancel={() => dispatch(setShowDeleteSubRiskSectionDialog(false))}
          isLoading={loading.deleteSubRiskSection}
        />
      )}
    </div>
  )
}

export default ProductsSubRiskSections
