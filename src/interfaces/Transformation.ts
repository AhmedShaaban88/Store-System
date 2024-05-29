export interface Transformation {
  m_Item1: Transformation[];
  m_Item2: number;
}
export interface ITransformation {
  TransformPermissionId: string;
  TransformPermissionRequestDate: Date;
  TransformPermissionDate: Date;
  TransformPermissionName: string;
}
export interface TransformationRequested {
	TransformationOrderId?: number;
	StockId_From_FK: number;
	TransformPermissionDate: any;
	TransformPermissionName: string;
	TransformationDataObj: Array<TransformationDetailsData>;
}
export interface TransformationDetailsData {
    TransformationId_Fk?: number;
    ItemsId_FK: number;
    StockId_To_FK: number;
    TransformQuantityBox: number;
    TransformQuantityNumber: number;

}

