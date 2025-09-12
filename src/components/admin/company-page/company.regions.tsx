import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import SearchBar from "@/components/SearchBar";
import { Alert, AlertDescription } from "@/components/UI/alert";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/new-button";
import { Skeleton } from "@/components/UI/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { useToast } from "@/components/UI/use-toast";
import {
  clearRegionMessages,
  deleteRegion,
  getAllRegions,
  selectRegion,
} from "@/features/reducers/companyReducers/regionSlice";
import {
  selectUiState,
  setShowCreateRegionDialog,
  setShowDeleteRegionDialog,
  setShowEditRegionDialog,
} from "@/features/reducers/uiReducers/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import { Region } from "@/types/regions";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CreateRegionModal, EditRegionModal } from "../../components.region";

const CompanyRegions = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [regionIdToDelete, setRegionIdToDelete] = useState<string | null>(null);
  const [regionToEdit, setRegionToEdit] = useState<Region | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { regions, loading, error, success } = useAppSelector(selectRegion);
  const {
    showDeleteRegionDialog,
    showCreateRegionDialog,
    showEditRegionDialog,
  } = useAppSelector(selectUiState);

  useEffect(() => {
    dispatch(getAllRegions());
  }, [dispatch]);

  useEffect(() => {
    if (success.deleteRegion) {
      dispatch(clearRegionMessages());
      dispatch(getAllRegions());
      setRegionIdToDelete(null);
      dispatch(setShowDeleteRegionDialog(false));
      toast({
        title: "Region Deleted!",
        description: "You have been successfully deleted the region.",
        variant: "success",
        duration: 3000,
      });
    } else if (error.deleteRegion) {
      dispatch(clearRegionMessages());
      console.log(error.deleteRegion);
      toast({
        description: "Failed to delete region. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [success.deleteRegion, dispatch, error.deleteRegion]);

  const confirmDeleteRegion = async (regionId: string | null) => {
    if (regionId === null) {
      console.log("No Region Id");
      toast({
        description: "Please select a region to delete and try again!",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    dispatch(deleteRegion(regionId));
  };

  const filteredRegions: Region[] = regions.filter((region) => {
    const term = searchTerm.toLowerCase();
    return (
      region.region?.toLowerCase().includes(term) ||
      region.manager?.toLowerCase().includes(term) ||
      region.address?.toLowerCase().includes(term) ||
      region.email?.toLowerCase().includes(term)
    );
  });

  const pageSize = 10;
  const totalPages = filteredRegions
    ? Math.ceil(filteredRegions.length / pageSize)
    : 0;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="py-4 flex flex-col gap-6 bg-[#f8f9fa] min-h-[calc(100vh_-_64px)]">
      <div className="w-full flex flex-wrap gap-4 items-center mb-4">
        <SearchBar
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Button
          className="bg-primary-blue text-white"
          onClick={() => dispatch(setShowCreateRegionDialog(true))}
        >
          Add New Region
        </Button>
      </div>
      {error.getAllRegions ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading regions</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {loading.getAllRegions ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-blue-100 space-y-3"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))
              ) : filteredRegions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-medium mb-2">
                    {searchTerm.length > 0
                      ? "No Region match your filters"
                      : "No Regions found"}
                  </p>
                  <p className="text-xs">
                    {searchTerm.length > 0
                      ? "Try adjusting your search criteria to see all regions."
                      : "Create a new region under this risk or select a risk in the dropdown to get started."}
                  </p>
                  {searchTerm.length > 0 && (
                    <Button //@ts-ignore
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="mt-3 text-xs border-blue-300 text-blue-900 hover:bg-blue-50 bg-transparent"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              ) : (
                filteredRegions.map((region) => (
                  <div
                    key={region.regionID}
                    className="p-4 border-b border-blue-100 cursor-pointer hover:bg-blue-50/50 transition-colors"
                    // onClick={() => navigate(`${region.regionNo}/detail`)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          {/* {region.policyNo && (
                          <div className="text-sm font-medium text-blue-900">
                            {region.policyNo}
                          </div>
                        )} */}
                          {/* <div className="text-xs text-blue-600">
                          {region.regionNo}
                        </div> */}
                        </div>
                        {/* {getStatusBadge(region.remarks, region.tag)} */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100 hover:bg-blue-50/30">
                    <TableHead className="min-w-[150px] text-blue-900 font-semibold">
                      Region
                    </TableHead>
                    <TableHead className="min-w-[180px] text-blue-900 font-semibold">
                      Manager
                    </TableHead>
                    <TableHead className="min-w-[120px] text-blue-900 font-semibold">
                      Address
                    </TableHead>
                    <TableHead className="min-w-[120px] text-blue-900 font-semibold">
                      Email
                    </TableHead>
                    <TableHead className="min-w-[100px] text-blue-900 font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.getAllRegions ? (
                    Array.from({ length: pageSize }).map((_, index) => (
                      <TableRow key={index} className="border-blue-100">
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredRegions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center p-8">
                        <div className="p-8 text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm font-medium mb-2">
                            {searchTerm.length > 0
                              ? "No Region match your filters"
                              : "No Regions found"}
                          </p>
                          <p className="text-xs">
                            {searchTerm.length > 0
                              ? "Try adjusting your search criteria to see all regions."
                              : "Create a new region under this risk or select a risk in the dropdown to get started."}
                          </p>
                          {searchTerm.length > 0 && (
                            <Button //@ts-ignore
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                              className="mt-3 text-xs border-blue-300 text-blue-900 hover:bg-blue-50 bg-transparent"
                            >
                              Clear Filter
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegions.map((region) => (
                      <TableRow
                        key={region.regionID}
                        className="cursor-pointer hover:bg-blue-50/50 border-blue-100 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {region.region}
                        </TableCell>
                        <TableCell>{region.manager}</TableCell>
                        <TableCell>
                          {
                            //@ts-ignore
                            region.address
                          }
                        </TableCell>
                        <TableCell className="">{region.email}</TableCell>
                        <TableCell className="flex gap-2 items-center justify-end">
                          <Button
                            className="action-button edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegionToEdit(region);
                              dispatch(setShowEditRegionDialog(true));
                            }}
                          >
                            Edit
                          </Button>
                          <Button //@ts-ignore
                            variant="destructive"
                            className="action-button delete"
                            onClick={() => {
                              setRegionIdToDelete(region.regionID);
                              dispatch(setShowDeleteRegionDialog(true));
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
            </div>

            {/* Pagination */}
            {regions && totalPages > 1 && (
              <div className="border-t border-blue-100 p-4 bg-blue-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 order-2 sm:order-1">
                    Page{" "}
                    <span className="font-medium text-blue-600">
                      {currentPage}
                    </span>{" "}
                    of <span className="font-medium">{totalPages}</span>
                    {searchTerm.length > 0 && (
                      <span className="ml-2 text-xs">(filtered results)</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                    {/* First Page */}
                    <Button //@ts-ignore
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)} // @ts-ignore
                      disabled={currentPage === 1 || loading.getProposals}
                      className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    {/* Previous Page */}
                    <Button //@ts-ignore
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)} // @ts-ignore
                      disabled={currentPage === 1 || loading.getProposals}
                      className="h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        {
                          length: Math.min(
                            window.innerWidth < 640 ? 3 : 5,
                            totalPages
                          ),
                        },
                        (_, i) => {
                          let pageNum: number;
                          const maxVisible = window.innerWidth < 640 ? 3 : 5;
                          if (totalPages <= maxVisible) {
                            pageNum = i + 1;
                          } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                            pageNum = i + 1;
                          } else if (
                            currentPage >=
                            totalPages - Math.floor(maxVisible / 2)
                          ) {
                            pageNum = totalPages - maxVisible + 1 + i;
                          } else {
                            pageNum =
                              currentPage - Math.floor(maxVisible / 2) + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              //@ts-ignore
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)} // @ts-ignore
                              disabled={loading.getProposals}
                              className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                                currentPage === pageNum
                                  ? "bg-blue-900 hover:bg-blue-900"
                                  : "border-blue-900 text-blue-900 hover:bg-blue-50"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    {/* Next Page */}
                    <Button //@ts-ignore
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)} // @ts-ignore
                      disabled={
                        currentPage === totalPages || loading.getAllRegions
                      }
                      className="h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {/* Last Page */}
                    <Button //@ts-ignore
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)} // @ts-ignore
                      disabled={
                        currentPage === totalPages || loading.getAllRegions
                      }
                      className="hidden sm:flex h-8 w-8 p-0 border-blue-300 text-blue-900 hover:bg-blue-50"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showCreateRegionDialog && (
        <CreateRegionModal
          isOpen={showCreateRegionDialog}
          onClose={() => dispatch(setShowCreateRegionDialog(false))}
        />
      )}

      {showEditRegionDialog && (
        <EditRegionModal
          isOpen={showEditRegionDialog}
          onClose={() => {
            dispatch(setShowEditRegionDialog(false));
            setRegionToEdit(null);
          }}
          region={regionToEdit}
        />
      )}

      {showDeleteRegionDialog && (
        <ConfirmationModal
          title="Delete Region"
          message="Are you sure you want to delete this Region Sub Risk and its related sections, fields and rates? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => confirmDeleteRegion(regionIdToDelete)}
          onCancel={() => dispatch(setShowDeleteRegionDialog(false))}
          isLoading={loading.deleteRegion}
        />
      )}
    </div>
  );
};

export default CompanyRegions;
