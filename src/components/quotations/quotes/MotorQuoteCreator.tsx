//@ts-nocheck
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../features/store"
import { Button } from "../../../components/UI/new-button"
import Input from "../../../components/UI/Input"
import { Label } from "../../../components/UI/label"
import { AddVehicleModal } from "../../../components/Modals/AddVehicleModal"
import { toast } from "../../../components/UI/use-toast"
import type { MotorVehicleUI, MotorCalculationRequest } from "../../../types/motor-quotation"
import {
    calculateMotorComplete,
    recalculateMotorComplete,
    getMotorCalculationBreakdown,
    setVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    clearMessages,
} from "../../../features/reducers/quoteReducers/motorQuotationSlice"
import "./motor-quote-creator.css"
import { useNavigate, useParams } from "react-router-dom"

export default function MotorQuoteCreator() {
    const { proposalNo } = useParams<{ proposalNo: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const { vehicles, currentCalculation, calculationBreakdown, loading, error, success } = useSelector(
        (state: RootState) => state.motorQuotations,
    )

    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
    const [adjustments, setAdjustments] = useState({
        otherDiscountRate: 0,
        otherLoadingRate: 0,
    })
    const [coverDays, setCoverDays] = useState(365)
    const [proportionRate, setProportionRate] = useState(100)
    const [exchangeRate, setExchangeRate] = useState(1)
    const [currency, setCurrency] = useState("NGN")

    // Load calculation breakdown if exists
    useEffect(() => {
        if (proposalNo) {
            dispatch(getMotorCalculationBreakdown(proposalNo) as any)
        }
    }, [proposalNo, dispatch])

    // Populate vehicles from breakdown if available
    useEffect(() => {
        if (calculationBreakdown?.vehicleCalculations && vehicles.length === 0) {
            const loadedVehicles = calculationBreakdown.vehicleCalculations.map((v, idx) => ({
                ...v,
                uiId: `vehicle_${idx}`,
                _collapsed: false,
                _showDetails: false,
            }))
            dispatch(setVehicles(loadedVehicles))

            if (calculationBreakdown.inputs) {
                setAdjustments({
                    otherDiscountRate: calculationBreakdown.inputs.otherDiscountRate || 0,
                    otherLoadingRate: calculationBreakdown.inputs.otherLoadingRate || 0,
                })
                setCoverDays(calculationBreakdown.inputs.coverDays || 365)
                setProportionRate(calculationBreakdown.inputs.proportionRate || 100)
                setExchangeRate(calculationBreakdown.inputs.exchangeRate || 1)
                setCurrency(calculationBreakdown.inputs.currency || "NGN")
            }
        }
    }, [calculationBreakdown, dispatch, vehicles.length])

    useEffect(() => {
        if (success?.calculate) {
            dispatch(clearMessages() as any)
        }
    }, [success?.calculate, dispatch])

    const handleAddVehicle = () => {
        setEditingVehicleId(null)
        setShowAddVehicleModal(true)
    }

    const handleEditVehicle = (vehicleId: string) => {
        setEditingVehicleId(vehicleId)
        setShowAddVehicleModal(true)
    }

    const handleSaveVehicle = (vehicle: MotorVehicleUI) => {
        if (editingVehicleId) {
            dispatch(updateVehicle(vehicle))
        } else {
            dispatch(addVehicle(vehicle))
        }
        setShowAddVehicleModal(false)
        setEditingVehicleId(null)
        toast({
            description: editingVehicleId ? "Vehicle updated" : "Vehicle added",
            variant: "success",
            duration: 2000,
        })
    }

    const handleDeleteVehicle = (vehicleId: string) => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            dispatch(removeVehicle(vehicleId))
            toast({
                description: "Vehicle deleted",
                variant: "success",
                duration: 2000,
            })
        }
    }

    const handleCalculate = async () => {
        if (vehicles.length === 0) {
            toast({
                description: "Please add at least one vehicle",
                variant: "warning",
                duration: 2000,
            })
            return
        }

        const calculationRequest: MotorCalculationRequest = {
            proposalNo: proposalNo || "",
            vehicles: vehicles.map(({ _collapsed, _showDetails, uiId, ...v }) => v),
            otherDiscountRate: adjustments.otherDiscountRate,
            otherLoadingRate: adjustments.otherLoadingRate,
            proportionRate,
            exchangeRate,
            currency,
            coverDays,
            calculatedBy: "SYSTEM",
        }

        try {
            if (currentCalculation) {
                await dispatch(
                    recalculateMotorComplete({
                        proposalNo: proposalNo || "",
                        calculationData: calculationRequest,
                    }) as any,
                ).unwrap()
            } else {
                await dispatch(
                    calculateMotorComplete({
                        proposalNo: proposalNo || "",
                        calculationData: calculationRequest,
                    }) as any,
                ).unwrap()
            }

            // Refresh breakdown
            if (proposalNo) {
                await dispatch(getMotorCalculationBreakdown(proposalNo) as any)
            }

            toast({
                description: "Calculation completed successfully",
                variant: "success",
                duration: 2000,
            })
        } catch (err: any) {
            toast({
                description: "Calculation failed",
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "N/A"
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount)
    }

    return (
        <div className="motor-qc-container">
            <div className="motor-qc-header">
                <div>
                    <h1>Motor Quote Creator</h1>
                    <p className="motor-qc-proposal-info">Proposal: {proposalNo || "New"}</p>
                </div>
                <div className="motor-qc-header-actions">
                    <Button onClick={handleCancel} variant="outline">
                        Back
                    </Button>
                    <Button onClick={handleCalculate} disabled={loading?.calculate || vehicles.length === 0}>
                        {loading?.calculate ? "Calculating..." : currentCalculation ? "Recalculate" : "Calculate"}
                    </Button>
                </div>
            </div>

            {error?.calculate && <div className="motor-qc-error-message">{error.calculate}</div>}
            {success?.calculate && <div className="motor-qc-success-message">Calculation completed successfully!</div>}

            <div className="motor-qc-content">
                {/* Vehicles Panel */}
                <div className="motor-qc-vehicles-panel">
                    <div className="motor-qc-vehicles-header">
                        <h3>Vehicles ({vehicles.length})</h3>
                        <Button onClick={handleAddVehicle} size="sm">
                            Add Vehicle
                        </Button>
                    </div>

                    {vehicles.length === 0 ? (
                        <div className="motor-qc-no-vehicles">
                            <p>No vehicles added yet. Click "Add Vehicle" to begin.</p>
                        </div>
                    ) : (
                        <div className="motor-qc-vehicles-table-wrap">
                            <table className="motor-qc-vehicles-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Registration</th>
                                        <th>Type</th>
                                        <th>Make/Model</th>
                                        <th>Value</th>
                                        <th>Premium</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((vehicle, index) => (
                                        <tr key={vehicle.uiId}>
                                            <td>{index + 1}</td>
                                            <td>{vehicle.vehicleRegNo}</td>
                                            <td>{vehicle.vehicleType}</td>
                                            <td>
                                                {vehicle.vehicleMake} {vehicle.vehicleModel}
                                            </td>
                                            <td>{formatCurrency(vehicle.vehicleValue)}</td>
                                            <td>{vehicle.netPremium ? formatCurrency(vehicle.netPremium) : "—"}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <Button onClick={() => handleEditVehicle(vehicle.uiId || "")} size="sm" variant="outline">
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteVehicle(vehicle.uiId || "")}
                                                        size="sm"
                                                        variant="outline"
                                                        className="motor-qc-delete-btn"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Adjustments Panel */}
                <div className="motor-qc-adjustments-panel">
                    <h3>Proposal Adjustments</h3>

                    <div className="motor-qc-adjustments-grid">
                        <div className="motor-qc-adjustment-section">
                            <h4>Discounts & Loadings</h4>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="otherDiscountRate">Other Discount Rate (%)</Label>
                                <Input
                                    id="otherDiscountRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={adjustments.otherDiscountRate}
                                    onChange={(e) =>
                                        setAdjustments((prev) => ({
                                            ...prev,
                                            otherDiscountRate: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="otherLoadingRate">Other Loading Rate (%)</Label>
                                <Input
                                    id="otherLoadingRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={adjustments.otherLoadingRate}
                                    onChange={(e) =>
                                        setAdjustments((prev) => ({
                                            ...prev,
                                            otherLoadingRate: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="motor-qc-adjustment-section">
                            <h4>Coverage Details</h4>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="coverDays">Cover Days</Label>
                                <Input
                                    id="coverDays"
                                    type="number"
                                    min="0"
                                    value={coverDays}
                                    onChange={(e) => setCoverDays(Number(e.target.value))}
                                />
                            </div>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="proportionRate">Proportion Rate (%)</Label>
                                <Input
                                    id="proportionRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={proportionRate}
                                    onChange={(e) => setProportionRate(Number(e.target.value))}
                                />
                            </div>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="exchangeRate">Exchange Rate</Label>
                                <Input
                                    id="exchangeRate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                                />
                            </div>

                            <div className="motor-qc-adjustment-field">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    placeholder="e.g., NGN"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculation Results */}
                {currentCalculation && (
                    <div className="motor-qc-calculation-results">
                        <h3>Calculation Results</h3>

                        <div className="motor-qc-results-grid">
                            <div className="motor-qc-result-item">
                                <Label>Total Vehicle Value</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.totalVehicleValue)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Total Net Premium</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.totalNetPremium)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Vehicle Count</Label>
                                <div className="motor-qc-result-value">{currentCalculation.vehicleCount}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Other Discount Amount</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.otherDiscountAmount)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Other Loading Amount</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.otherLoadingAmount)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Net Premium Due</Label>
                                <div className="motor-qc-result-value highlight">
                                    {formatCurrency(currentCalculation.netPremiumDue)}
                                </div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Pro-Rata Premium</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.proRataPremium)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Share Sum Insured</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.shareSumInsured)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Share Premium</Label>
                                <div className="motor-qc-result-value">{formatCurrency(currentCalculation.sharePremium)}</div>
                            </div>

                            <div className="motor-qc-result-item">
                                <Label>Final Premium Due</Label>
                                <div className="motor-qc-result-value highlight">
                                    {formatCurrency(currentCalculation.finalPremiumDue)}
                                </div>
                            </div>
                        </div>

                        {/* Vehicles Breakdown */}
                        {currentCalculation.calculatedVehicles && currentCalculation.calculatedVehicles.length > 0 && (
                            <div className="motor-qc-vehicles-breakdown">
                                <h4>Vehicles Breakdown</h4>
                                <div className="motor-qc-breakdown-table-wrap">
                                    <table className="motor-qc-breakdown-table">
                                        <thead>
                                            <tr>
                                                <th>Reg No</th>
                                                <th>Type</th>
                                                <th>Value</th>
                                                <th>Basic Premium</th>
                                                <th>After Discounts</th>
                                                <th>Gross Premium</th>
                                                <th>Net Premium</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentCalculation.calculatedVehicles.map((vehicle) => (
                                                <tr key={vehicle.vehicleRegNo}>
                                                    <td>{vehicle.vehicleRegNo}</td>
                                                    <td>{vehicle.vehicleType}</td>
                                                    <td>{formatCurrency(vehicle.vehicleValue)}</td>
                                                    <td>{formatCurrency(vehicle.basicPremium)}</td>
                                                    <td>{formatCurrency(vehicle.premiumAfterDiscounts)}</td>
                                                    <td>{formatCurrency(vehicle.grossPremium)}</td>
                                                    <td className="highlight">{formatCurrency(vehicle.netPremium)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showAddVehicleModal && (
                <AddVehicleModal
                    isOpen={showAddVehicleModal}
                    onClose={() => {
                        setShowAddVehicleModal(false)
                        setEditingVehicleId(null)
                    }}
                    onSave={handleSaveVehicle}
                    vehicle={editingVehicleId ? vehicles.find((v) => v.uiId === editingVehicleId) : undefined}
                />
            )}
        </div>
    )
}
