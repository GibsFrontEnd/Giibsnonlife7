"use client"

import { useState } from "react"
import { Button } from "../../../components/UI/new-button"
import Input from "../../../components/UI/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/UI/table"
import { Search } from "lucide-react"
import "./EnquiriesPolicies.css"

interface Policy {
  id: number
  policyNo: string
  effectiveDate: string
  insured: string
  broker: string
  product: string
  premium: string
  status?: string
}

const EnquiriesPolicies = () => {
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data - replace with actual data when implementing endpoints
  const samplePolicies: Policy[] = [
    {
      id: 1,
      policyNo: "POL-2024-001",
      effectiveDate: "2024-01-15",
      insured: "John Doe",
      broker: "ABC Insurance Brokers",
      product: "Auto Insurance",
      premium: "$1,200.00",
      status: "and get insured",
    },
    // Add more sample data as needed
  ]

  const [policies] = useState<Policy[]>(samplePolicies)

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insured.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.product.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="ep-policies-container">
      <div className="ep-policies-header">
        <h1 className="ep-policies-title">Policies</h1>

        <div className="ep-search-container">
          <div className="ep-search-wrapper">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ep-search-input"
            />
            <Button className="ep-search-button">
              <Search className="ep-search-icon" />
            </Button>
          </div>
        </div>
      </div>

      <div className="ep-table-container">
        <Table className="ep-policies-table">
          <TableHeader>
            <TableRow className="ep-table-header-row">
              <TableHead className="ep-table-header">POLICY NO</TableHead>
              <TableHead className="ep-table-header">EFFECTIVE DATE</TableHead>
              <TableHead className="ep-table-header">INSURED</TableHead>
              <TableHead className="ep-table-header">BROKER</TableHead>
              <TableHead className="ep-table-header">PRODUCT</TableHead>
              <TableHead className="ep-table-header">PREMIUM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="ep-no-data-cell">
                  <div className="ep-no-data-content">
                    <div className="ep-sample-badge">and get insured</div>
                    <p className="ep-no-data-text">No policies found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => (
                <TableRow key={policy.id} className="ep-table-row">
                  <TableCell className="ep-table-cell ep-policy-no-cell">
                    <div className="ep-policy-no-content">
                      {policy.policyNo}
                      {policy.status && <span className="ep-status-badge">{policy.status}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="ep-table-cell">{policy.effectiveDate}</TableCell>
                  <TableCell className="ep-table-cell">{policy.insured}</TableCell>
                  <TableCell className="ep-table-cell">{policy.broker}</TableCell>
                  <TableCell className="ep-table-cell">{policy.product}</TableCell>
                  <TableCell className="ep-table-cell ep-premium-cell">{policy.premium}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default EnquiriesPolicies
