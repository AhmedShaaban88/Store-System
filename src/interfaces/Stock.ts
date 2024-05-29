export interface Stock {
  m_Item1: IStock[];
  m_Item2: number;
}
export interface IStock {
  place: string;
  PlaceId_FK: number;
  StockCode: number;
  StockId: number;
  StockIsActive: boolean;
  StockNameAr: string;
  StockNameEn: string;
  StockTypeId_FK: number;
  StockTypesNameAr: string;
  StockTypesNameEn: string;
  ColledgeId: number;
  FloorId: number;
  PlaceId: number;
}
