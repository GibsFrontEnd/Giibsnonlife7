import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-apps";
import {
  clearRegionMessages,
  createRegion,
  getAllRegions,
  selectRegion,
  updateRegion,
} from "@/features/reducers/companyReducers/regionSlice";
import { Region } from "@/types/regions";
import { Button } from "@/components/UI/new-button";
import { Input } from "@/components/UI/new-input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useToast } from "@/components/UI/use-toast";
import { OutsideDismissDialog } from "@/components/UI/dialog";
import { generateHash } from "@/utils/minor-utils";
import useUser from "@/hooks/use-user";

interface RegionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRegionModal = ({
  isOpen,
  onClose,
}: RegionCreateModalProps) => {
  const user = useUser();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { loading, error, success } = useAppSelector(selectRegion);

  const [formData, setFormData] = useState<
    Omit<
      Region,
      | "regionID"
      | "deleted"
      | "submittedBy"
      | "submittedOn"
      | "modifiedBy"
      | "modifiedOn"
    >
  >({
    region: "",
    manager: "",
    address: "",
    mobilePhone: "",
    landPhone: "",
    email: "",
    fax: "",
    remarks: "",
    active: true,
  });

  const [errors, setErrors] = useState<Partial<Region>>({});

  useEffect(() => {
    if (success.createRegion) {
      dispatch(clearRegionMessages());
      toast({
        title: "Region Created!",
        description: "The region has been successfully created.",
        variant: "success",
        duration: 3000,
      });
      onClose();
      resetForm();
    } else if (error.createRegion) {
      dispatch(clearRegionMessages());
      toast({
        description: "Failed to create region. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [success.createRegion, error.createRegion, onClose]);

  const resetForm = () => {
    setFormData({
      region: "",
      manager: "",
      address: "",
      mobilePhone: "",
      landPhone: "",
      email: "",
      fax: "",
      remarks: "",
      active: true,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<Region> = {};

    if (!formData.region.trim()) {
      newErrors.region = "Region name is required";
    }
    if (!formData.manager.trim()) {
      newErrors.manager = "Manager name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = "Mobile phone is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("errors");

    const regionData: Region = {
      ...formData,
      regionID: generateHash(),
      deleted: false,
      submittedBy: user.username || "unknown",
      submittedOn: new Date().toISOString(),
      modifiedBy: user.username,
      modifiedOn: new Date().toISOString(),
    };

    dispatch(createRegion(regionData));
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <OutsideDismissDialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Region</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region Name *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Enter region name"
                className={errors.region ? "border-red-500" : ""}
              />
              {errors.region && (
                <p className="text-sm text-red-500">{errors.region}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager *</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                placeholder="Enter manager name"
                className={errors.manager ? "border-red-500" : ""}
              />
              {errors.manager && (
                <p className="text-sm text-red-500">{errors.manager}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobile Phone *</Label>
              <Input
                id="mobilePhone"
                value={formData.mobilePhone}
                onChange={(e) =>
                  handleInputChange("mobilePhone", e.target.value)
                }
                placeholder="Enter mobile phone"
                className={errors.mobilePhone ? "border-red-500" : ""}
              />
              {errors.mobilePhone && (
                <p className="text-sm text-red-500">{errors.mobilePhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landPhone">Land Phone</Label>
              <Input
                id="landPhone"
                value={formData.landPhone}
                onChange={(e) => handleInputChange("landPhone", e.target.value)}
                placeholder="Enter land phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="Enter fax number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Enter any remarks"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="gap-2 flex">
            <Button
              variant="outline"
              onClick={handleClose} // @ts-ignore
              disabled={loading.createRegion}
            >
              Cancel
            </Button>
            <Button // @ts-ignore
              type="submit"
              className="flex-1 bg-primary-blue text-white relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              disabled={loading.createRegion}
            >
              {loading.createRegion ? "Creating..." : "Create Region"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </OutsideDismissDialog>
  );
};

interface RegionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region | null;
}

export const EditRegionModal = ({
  isOpen,
  onClose,
  region,
}: RegionEditModalProps) => {
  const user = useUser();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { loading, error, success } = useAppSelector(selectRegion);

  const [formData, setFormData] = useState<
    Omit<
      Region,
      | "regionID"
      | "deleted"
      | "submittedBy"
      | "submittedOn"
      | "modifiedBy"
      | "modifiedOn"
    >
  >({
    region: "",
    manager: "",
    address: "",
    mobilePhone: "",
    landPhone: "",
    email: "",
    fax: "",
    remarks: "",
    active: true,
  });

  const [errors, setErrors] = useState<Partial<Region>>({});

  useEffect(() => {
    if (region) {
      setFormData({
        region: region.region || "",
        manager: region.manager || "",
        address: region.address || "",
        mobilePhone: region.mobilePhone || "",
        landPhone: region.landPhone || "",
        email: region.email || "",
        fax: region.fax || "",
        remarks: region.remarks || "",
        active: region.active !== undefined ? region.active : true,
      });
    }
  }, [region]);

  useEffect(() => {
    if (success.updateRegion) {
      dispatch(clearRegionMessages());
      dispatch(getAllRegions());
      toast({
        title: "Region Updated!",
        description: "The region has been successfully updated.",
        variant: "success",
        duration: 3000,
      });
      onClose();
      resetForm();
    } else if (error.updateRegion) {
      dispatch(clearRegionMessages());
      toast({
        description: "Failed to update region. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [success.updateRegion, error.updateRegion, onClose]);

  const resetForm = () => {
    setFormData({
      region: "",
      manager: "",
      address: "",
      mobilePhone: "",
      landPhone: "",
      email: "",
      fax: "",
      remarks: "",
      active: true,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<Region> = {};

    if (!formData.region.trim()) {
      newErrors.region = "Region name is required";
    }
    if (!formData.manager.trim()) {
      newErrors.manager = "Manager name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = "Mobile phone is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !region) {
      return;
    }

    const updatedRegionData: Region = {
      ...region,
      ...formData,
      modifiedBy: user.username,
      modifiedOn: new Date().toISOString(),
    };

    dispatch(
      updateRegion({
        regionId: region.regionID,
        data: updatedRegionData,
      })
    );
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <OutsideDismissDialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Region</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region Name *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Enter region name"
                className={errors.region ? "border-red-500" : ""}
              />
              {errors.region && (
                <p className="text-sm text-red-500">{errors.region}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager *</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                placeholder="Enter manager name"
                className={errors.manager ? "border-red-500" : ""}
              />
              {errors.manager && (
                <p className="text-sm text-red-500">{errors.manager}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobile Phone *</Label>
              <Input
                id="mobilePhone"
                value={formData.mobilePhone}
                onChange={(e) =>
                  handleInputChange("mobilePhone", e.target.value)
                }
                placeholder="Enter mobile phone"
                className={errors.mobilePhone ? "border-red-500" : ""}
              />
              {errors.mobilePhone && (
                <p className="text-sm text-red-500">{errors.mobilePhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landPhone">Land Phone</Label>
              <Input
                id="landPhone"
                value={formData.landPhone}
                onChange={(e) => handleInputChange("landPhone", e.target.value)}
                placeholder="Enter land phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={formData.fax}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="Enter fax number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Enter any remarks"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="gap-2 flex">
            <Button
              variant="outline"
              onClick={handleClose} // @ts-ignore
              disabled={loading.updateRegion}
            >
              Cancel
            </Button>
            <Button // @ts-ignore
              type="submit"
              className="flex-1 bg-primary-blue text-white"
              disabled={loading.updateRegion}
            >
              {loading.updateRegion ? "Updating..." : "Update Region"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </OutsideDismissDialog>
  );
};
