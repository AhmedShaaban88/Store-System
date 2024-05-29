export interface Returns {
  m_Item1: IReturn[];
  m_Item2: number;
}
export interface IReturn {
  RecievedFromMaintanceDate: any;
  MaintenanceOrderId_FK: number;
  RecievedFromMaintanceId: number;
  RecievedFromMaintanceName: string;
  RecievedFromMaintanceRequestDate?: Date;
  RecievedItemDetails: Array<ReturnItemDetails>;
}
export interface ReturnItemDetails {
  RecievedFromMaintanceItemsQuantityNumber: number;
  RecievedFromMaintanceItemsQuantityBox: number;
  ItemsId_FK: number;
  RecievedMaintanceStockId_To_FK: number;
  RecievedMaintanceStockId_From_FK: number;
  RecievedFromMaintanceId_FK: number;
}
export interface ReturnItem {
  MaintenanceOrderId_FK: number;
  RecievedFromMaintanceName: string;
  RecievedFromMaintanceDate: any;
  RecievedDatalist: any;
  RecievedFromMaintanceId?: number;
}
