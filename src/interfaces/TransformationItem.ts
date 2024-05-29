export interface TransformationDetails {
  TransformPermissionId: number;
  StockIdFrom: number;
  TransformPermissionDate: Date;
  TransformPermissionRequestDate: Date;
  StockFromNameAr: string;
  StockFromNameEn: string;
  TransformPermissionName: string;
  ItemsDetails: Array<TransformationItemDetails>;
}

export interface TransformationItemDetails {
  ItemsId_FK: number;
  ItemsName: string;
  StockIdTo: number;
  StockToNameAr: string;
  StockToNameEn: string;
  TransformPermissionItemsQuantity: number;
  TransformPermissionItemsBox: number;
}
