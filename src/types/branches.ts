export interface Branch {
  branchID: string;
  companyID: string | null;
  regionID: string | null;
  stateID: string | null;
  branchID2: string;
  description: string;
  manager: string;
  address: string;
  mobilePhone: string;
  landPhone: string | null;
  email: string;
  fax: string;
  deleted: boolean;
  active: boolean;
  remarks: string | null;
  submittedBy: string;
  submittedOn: string;
  modifiedBy: string | null;
  modifiedOn: string | null;
}
