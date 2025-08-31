export type ProductField = {
  name: string;
  type: string;
  required: boolean;
  description: string;
};

export type Product = {
  riskID: string;
  productID: string;
  productName: string;
  sections: unknown | null;
  fields: ProductField[];
  rates: unknown | null;
};

export interface ProductCreateUpdateRequest {
  productID: string;
  classID: string;
  midClassID: string;
  productName: string;
  shortName: string;
  naicomTypeID: string;
}

export interface ProductState {
  products: Product[];

  loading: {
    getAllProducts: boolean;
    getProductDetails: boolean;
    createProduct: boolean;
    updateProduct: boolean;
    deleteProduct: boolean;
  };
  error: {
    getAllProducts: unknown;
    getProductDetails: unknown;
    createProduct: unknown;
    updateProduct: unknown;
    deleteProduct: unknown;
  };
  success: {
    createProduct: boolean;
    updateProduct: boolean;
    deleteProduct: boolean;
  };
}
