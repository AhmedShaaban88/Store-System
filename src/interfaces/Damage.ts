export interface Damage {
  m_Item1: IDamage[];
  m_Item2: number;
}
export interface IDamage {
  DamageOrderId?: number;
  DamageOrderDate: any;
  DamageId?: number;
  DamageOrderName: string;
  DamageOrderRequestDate?: any;
  DamageDatalist: Array<IDamageData>;
}
export interface IDamageData {
  DamageOrderId_FK: number;
  ItemsId_FK: number;
  StockId_FK: number;
  DamageOrderQuantityBox: number;
  DamageOrderQuantityNumber: number;
}
