export interface Risk {
  riskID: string;
  name: string;
  description?: string;
}

export interface RiskState {
  risks: Risk[];

  loading: {
    getAllRisks: boolean;
  };
  error: {
    getAllRisks: unknown;
  };
}
