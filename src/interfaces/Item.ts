export interface Item {
  m_Item1: IItem[];
  m_Item2: number;
}
export interface IItem {
  CategoryId_FK?: number;
  ItemsCode?: number;
  ItemsId?: number;
  ItemsName: string;
  ItemSpecification: string;
  ItemBoxQuantity: number;
  ItemNote: string;
  CategoryNameEn?: string;
  CategoryNameAr?: string;
}
export interface ISearchData {
  SearchText: string;
  pageRowCount: number;
  pageNumber: number;
  CatId: number;
}
