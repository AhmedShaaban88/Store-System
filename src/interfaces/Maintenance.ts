export interface Maintenance {
  m_Item1: IMaintenance[];
  m_Item2: number;
}
export interface IMaintenance {
  MaintenanceOrderDate: Date;
  MaintenanceOrderId: number;
  MaintenanceOrderName: string;
  MaintenanceOrderiRequestDate: Date;
}
export interface IMaintenanceItem {
  MaintenaceOrderId?: number;
  MaintenaceDate: any;
  MaintenaceName: string;
  value: Array<any>;
}
