export interface Supply {
  m_Item1: ISupply[];
  m_Item2: number;
}
export interface ISupply {
  SupplyOrderDate: any;
  SupplyOrderId?: number;
  SupplyOrderName: string;
  SupplyOrderRequestDate?: any;
  SupplyDataObj: Array<any>;
}
