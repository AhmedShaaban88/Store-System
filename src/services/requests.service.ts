import { Injectable } from '@angular/core';
import {environment} from '../environments/environment.prod';
import {HttpClient, HttpErrorResponse,HttpHeaders} from '@angular/common/http';
import {throwError, Observable, BehaviorSubject} from 'rxjs';
import {Item, IItem} from '../interfaces/Item';
import {catchError, map} from 'rxjs/operators';
import {Category, ICategory} from '../interfaces/Category';
import {Transformation, TransformationRequested} from '../interfaces/Transformation';
import {TransformationDetails} from '../interfaces/TransformationItem';
import {Stock} from '../interfaces/Stock';
import {ISupply, Supply} from '../interfaces/Supply';
import {IMaintenanceItem, Maintenance} from '../interfaces/Maintenance';
import {Damage, IDamage} from '../interfaces/Damage';
import {IReturn, ReturnItem, Returns} from '../interfaces/Returns';
import {User} from '../interfaces/user';
import * as jwt_decode from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})

export class RequestsService {
  
 private baseUrl = environment.apiURL;
 private itemUrl = this.baseUrl + '/Items';
 private categoryUrl = this.baseUrl + '/Category';
 private stockUrl = this.baseUrl + '/Stock';
 private transformationUrl = this.baseUrl + '/TransformationRequest';
 private supplyUrl = this.baseUrl + '/SupplyRequest';
 private maintenanceUrl = this.baseUrl + '/MaintanceOrder';
 private damageUrl = this.baseUrl + '/DamageOrder';
 private returnsUrl = this.baseUrl + '/RecievedFromMaintance';
 private LoginUrl = this.baseUrl + '/UserLogin';
 public currentUserSubject: BehaviorSubject<User>;
 public currentUser: Observable<User>;
 
 constructor(private http: HttpClient) {
  if( JSON.parse(sessionStorage.getItem('currentUser')) != null){
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')).Message);
    this.currentUser = this.currentUserSubject.asObservable();
  }}
  public get currentUserValue(): any {

    const currentUseree = this.currentUserSubject.value;
     var decoded  = jwt_decode(currentUseree);
    return decoded;
}

  // items
  getAllItems(pageNo: number, deleteNo: number): Observable<Item[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<Item[]>(this.itemUrl + `?pageNumber=${pageNo}&pageRowCount=30&deleteNo=${deleteNo}`
       , {headers : headers}
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  addItem(item: IItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.itemUrl , item,   {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateItem(item: IItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.itemUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  deleteItem(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.itemUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }

  // category
  getAllCategories(pageNo: number, deleteNo: number): Observable<Category[]> {
    let headers = new HttpHeaders();
   headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);

   return this.http.get<Category[]>(this.categoryUrl +
     `?pageNumber=${pageNo}&pageRowCount=10&deleteNo=${deleteNo}`
   , {headers : headers} ) .pipe(
    catchError(this.handleError)
  );
 }
  getAllCategoriesEn(pageNo: number, deleteNo: number): Observable<Category[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<Category[]>(this.categoryUrl + `/GetAllCategoryEn?pageNumber=${pageNo}}&pageRowCount=10&deleteNo=${deleteNo}`
   , {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchCategory(searchText: string, pageNumber: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.categoryUrl + `/SearchAr?SearchText=${searchText}&pageRowCount=10&pageNumber=${pageNumber}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchCategoryEn(searchText: string, pageNumber: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.categoryUrl + `/SearchAr?SearchText=${searchText}&pageRowCount=10&pageNumber=${pageNumber}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  addCategory(item: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.categoryUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateCategory(item: ICategory) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.categoryUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  deleteCategory(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.categoryUrl + `/${id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  sortSearchCategory(pageNo: number, deleteNo: number, searchInput: string, type: string, col: string): Observable<any> {
    if (!type) {
      type = '';
    }
    if (!col) {
      col = '';
    }
    if (!searchInput) {
      searchInput = '';
    }
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);

    return this.http.get<Category[]>(this.categoryUrl +
      `/FilterCategory?pageNumber=${+pageNo}&pageRowCount=10&deleteNo=${+deleteNo}&SearchInput=${searchInput}&SortType=${type}&SortColumn=${col}`
      , { headers : headers} ) .pipe(
      catchError(this.handleError)
    );
  }
  // stock
  getAllStocks(pageNo: number, deleteNo: number): Observable<Stock[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
 
    return this.http.get<Stock[]>(this.stockUrl + `?pageNumber=${pageNo}&pageRowCount=10&deleteNo=${deleteNo}`
    , {headers : headers} 
    ).pipe(
      catchError(this.handleError)
    );
  }
  deleteStock(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.stockUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  toggleActivation(status: boolean, stockId: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.stockUrl + `/ActiveInActiveStock?Status=${status}&StockId=${stockId}`
    ,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllPlaces(): Observable<any[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any[]>(this.stockUrl + '/GetPlaces',  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllPlacesEn(): Observable<any[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any[]>(this.stockUrl + '/GetPlacesEnglish',  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getFloorInPlace(placeId: number | string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + `/GetFloorInPlace?PlaceId=${+placeId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getFloorInPlaceEn(placeId: number | string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + `/GetFloorInPlaceEng?PlaceId=${+placeId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getOfficeInFloor(floorId: number | string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + `/GetOfficeInFloor?FloorId=${+floorId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getOfficeInFloorEn(floorId: number | string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + `/GetOfficeInFloorEng?FloorId=${+floorId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllStockTypes(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + '/GetAllStocksType',  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllStockTypesEn(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.stockUrl + '/GetAllStocksTypeEng',  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  addStock(item: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.stockUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateStock(item: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.stockUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllCollages(pageNo: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.stockUrl + `/GetAllCollegeRooms?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  searchGetAllCollages(pageNo: number, searchKeyword: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.stockUrl + `/FilterGetAllCollegeRooms?pageNumber=${pageNo}&pageRowCount=10&SearchedRoom=${searchKeyword}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  sortSearchStock(pageNo: number, deleteNo: number, searchInput: string, type: string, col: string, stockId: number, placeId: number, isActive: boolean): Observable<any> {
    if (!type) {
      type = '';
    }
    if (!col) {
      col = '';
    }
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);

    return this.http.get<Category[]>(this.stockUrl +
      `/FilterStocks?pageNumber=${+pageNo}&pageRowCount=10&deleteNo=${+deleteNo}&SearchInput=${searchInput}&SortType=${type}&SortColumn=${col}&StockId=${stockId}&PlaceId=${placeId}&IsActive=${isActive}`
      , { headers : headers} ) .pipe(
      catchError(this.handleError)
    );
  }
  // transformation
  getAllTransformations(pageNo: number, deleteNo: number): Observable<Transformation[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
 
    return this.http.get<Transformation[]>(this.transformationUrl + `/GetAllTransformation?pageNumber=${pageNo}&pageRowCount=5&deleteNo=${deleteNo}`
    , {headers : headers} 
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  deleteTransformation(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.transformationUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getTransformation(id: string | number): Observable<TransformationDetails> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<TransformationDetails>(this.transformationUrl + `/GetTransformationOrderDetailsOREdit?TransformationId=${id}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }

  addTransformation(item: TransformationRequested) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.transformationUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateTransformation(item: TransformationRequested) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.transformationUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getItemBoxQuantity(itemCode: string | number, stockFrom): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/GetItemNameAndQuantity?ItemCode=${itemCode}&StockId=${stockFrom}` ,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getNextTransformationNumber() {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + '/CreateTransformationName',  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getItemName(itemCode: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/GetItemNameOnly?StockCode=${itemCode}`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getItemNameWithSearchTransform(pageNumber: number | string, itemNameAr: string, stockFrom: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/ItemsSearchNameAndCode?pageNumber=${pageNumber}&pageRowCount=10&ItemNameAr=${itemNameAr}&ItemIdFrom=${stockFrom}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  getItemNameWithSearch(pageNumber: number | string, itemNameAr: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/ItemsSearchNameAndCode?pageNumber=${pageNumber}&pageRowCount=10&ItemNameAr=${itemNameAr}`
      ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  getTransformationFromStore(pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjFrom?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getTransformationFromStoreEn(pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjFromEn?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getTransformationToStore(id: string | number , pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjTo?StockFromId=${id}&pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getTransformationToStoreEn(id: string | number , pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjToEn?StockFromId=${id}&pageNumber=${pageNo}&pageRowCount=10`, 
     {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getTransformationFromStoreEditMode(id: string | number , pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjFromForEdit?pageNumber=${pageNo}&pageRowCount=10&StockFromId=${id}`,
      {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }

  searchStocksFrom(pageNo: number, stockName: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjFromSearch?pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
    ,{headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchStocksFromEn(pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjFromSearchEn?pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchStocksTo(stockFrom: number, pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
      return this.http.get(this.transformationUrl + `/StocksObjToSearch?StockFromId=${stockFrom}&pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
      ,  {headers : headers}
      ).pipe(
        catchError(this.handleError)
      );
  }
  searchStocksToEn(stockFrom: number, pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/StocksObjToSearchEn?StockFromId=${stockFrom}&pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
    ,  {headers : headers}
    ) .pipe(
      catchError(this.handleError)
    );
  }
  checkAvailabilty(stockFromId: number , boxNum: number, quantityNum: number, itemId: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/AvailableQuantity?StockFromId=${+stockFromId}&BoxNum=${+boxNum}&QuantityNum=${+quantityNum}&ItemId=${+itemId}`
    ,  {headers : headers}
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  checkAvailabiltyEdit(stockFromId: number , boxNum: number, quantityNum: number, itemId: number, transformId: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.transformationUrl + `/AvailableQuantityInEdit?StockFromId=${+stockFromId}&BoxNum=${+boxNum}&QuantityNum=${+quantityNum}&ItemId=${+itemId}&TransformId=${transformId}`,
    {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  // supply
  getAllSupplies(pageNo: number, deleteNo: number): Observable<Supply[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
 
    return this.http.get<Supply[]>(this.supplyUrl + `/GetAllSupplyOrder?pageNumber=${pageNo}&pageRowCount=30&deleteNo=${deleteNo}`
    , {headers : headers} 
    
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  getNextSupplyName(): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + '/CreateSupplyName',  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  getAllEmployee(pageNo: number): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/GetAllEmpData?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  searchEmployee(pageNo: number, keyword: string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/EmpNameSearch?pageNumber=${pageNo}&pageRowCount=10&EmpName=${keyword}`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  addSupply(item: ISupply) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.supplyUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateSupply(item: ISupply) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.supplyUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  searchStocksToSupply( pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/StocksObjToSearch?pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchStocksToEnSupply( pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/StocksObjToSearchEn?pageNumber=${pageNo}&pageRowCount=10&StockName=${stockName}`
   , {headers : headers}
    ) .pipe(
      catchError(this.handleError)
    );
  }
  stocksToSupply(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/StocksObjTo?pageNumber=${pageNo}&pageRowCount=10`
    ,{headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  stocksToEnSupply(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/StocksObjToEn?pageNumber=${pageNo}&pageRowCount=10`
    ,{headers : headers}
    ) .pipe(
      catchError(this.handleError)
    );
  }
  getSupply(supplyId: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.supplyUrl + `/GetSupplyOrderDetailsOREdit?SupplyId=${supplyId}`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  deleteSupplyItem(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.supplyUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  // Maintaince
  getAllMaintaince(pageNo: number, deleteNo: number): Observable<Maintenance[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
 
    return this.http.get<Maintenance[]>(this.maintenanceUrl + `/GetAllMaintenaceOrder?pageNumber=${pageNo}&pageRowCount=30&deleteNo=${deleteNo}`
    , {headers : headers} 
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  getNextMaintainaceName(): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + '/CreateMaintenanceName',  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  stocksMaintainace(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + `/StocksFrom?pageNumber=${pageNo}&pageRowCount=10`
   , {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  stocksMaintainaceEn(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + `/StocksFromObjEn?pageNumber=${pageNo}&pageRowCount=10`
    ,  {headers : headers}
    ) .pipe(
      catchError(this.handleError)
    );
  }
  searchStocksMaintainace( pageNo: number, name: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + `/StocksFromObjSearchAr?pageNumber=${pageNo}&pageRowCount=10&SearchName=${name}`
    ,{headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchStocksMaintainaceEn( pageNo: number, name: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + `/StocksFromObjSearchEn?pageNumber=${pageNo}&pageRowCount=10&SearchName=${name}`,  {headers : headers}) .pipe(
      catchError(this.handleError)
    );
  }
  deleteMaintainanceItem(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.maintenanceUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  addMaintainance(item: IMaintenanceItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.maintenanceUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getMaintainance(id: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.maintenanceUrl + `/${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateMaintainance(item: IMaintenanceItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.maintenanceUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  // damage
  getAllDamage(pageNo: number, deleteNo: number): Observable<Damage[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<Damage[]>(this.damageUrl + `/GetAllDamageOrder?pageNumber=${pageNo}&pageRowCount=30&deleteNo=${deleteNo}`
    , {headers : headers} 
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  getNextDamageName(): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + '/CreateDamageName',  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  addDamage(item: IDamage) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.post(this.damageUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  updateDamage(item: IDamage) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.put(this.damageUrl , item,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  searchStocksToDamage( pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/StocksObjSearchAr?pageNumber=${pageNo}&pageRowCount=10&SearchName=${stockName}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }
  searchStocksToEnDamage( pageNo: number, stockName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/StocksObjSearchEn?pageNumber=${pageNo}&pageRowCount=10&SearchName=${stockName}`
    ,  {headers : headers}
    ) .pipe(
      catchError(this.handleError)
    );
  }
  stocksToDamage(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/StocksObj?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  stocksToEnDamage(pageNo: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/StocksObjEn?pageNumber=${pageNo}&pageRowCount=10`,  {headers : headers}) .pipe(
      catchError(this.handleError)
    );
  }
  getDamage(damageId: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/${damageId}`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  deleteDamageItem(id: number | string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.damageUrl + `/DeleteDamageOrder?DamageId=${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  checkAvailableQuantity(stockId: number, itemId: number, quantity: number, box: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.damageUrl + `/AvailableQuantity?StockFromId=${stockId}&Quantity=${quantity}&box=${box}&ItemId=${itemId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  // returns
  getAllReturns(pageNo: number, deleteNo: number): Observable<Returns[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<Returns[]>(this.returnsUrl + `/GetAllRecievedOrder?pageNumber=${pageNo}&pageRowCount=30&deleteNo=${deleteNo}`
    , {headers : headers} 
    )
      .pipe(
        catchError(this.handleError)
      );
  }
  getReturnItems(pageNumber: number, maintanceId: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.returnsUrl + `/GetAllOrdersInMaintance?pageNumber=${pageNumber}&pageRowCount=8&MaintanceId=${maintanceId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getReturnItemsEditMode(maintanceId: number, recievedId: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<any>(this.returnsUrl + `/GetAllOrdersInMaintanceWithoutLazy?MaintanceId=${+maintanceId}&RecievedId=${+recievedId}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  deleteReturn(id: number) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.delete(this.returnsUrl + `/DeleteRecievedOrder?RecievedId=${+id}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getReturn(id: string | number): Observable<IReturn> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get<IReturn>(this.returnsUrl + `/GetRecievedOrderDetailsOREdit?RecievedId=${+id}`,  {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
   addRetrun(item: ReturnItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
     return this.http.post(this.returnsUrl , item,  {headers : headers})
       .pipe(
         catchError(this.handleError)
       );
   }
   updateReturn(item: ReturnItem) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
     return this.http.put(this.returnsUrl , item,  {headers : headers})
       .pipe(
         catchError(this.handleError)
       );
   }
   getNextReturnNumber() {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
     return this.http.get(this.returnsUrl + '/CreateRecievedName',  {headers : headers}).pipe(
       catchError(this.handleError)
     );
   }
   getMaintainaceDropDown(pageNo: number | string): any {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
     return this.http.get(this.returnsUrl + `/MaintanceDropDown?pageNumber=${pageNo}&pageRowCount=10`
     ,{headers : headers}
     ).pipe(
       catchError(this.handleError)
     );
   }

   searchMaintainaceDropDown(pageNo: number, name: any) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
     return this.http.get(this.returnsUrl + `/MaintanceOrderSearch?pageNumber=${pageNo}&pageRowCount=10&SearchName=${name}`
   , {headers : headers}
     ).pipe(
       catchError(this.handleError)
     );
   }
  availableQuantityReturn(stockFrom: number, stockTo: number, quantity: number, box: number, itemId: number, maintainanceId: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Basic ' + JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.returnsUrl + `/AvailableQuantity?stockfromid=${+stockFrom}&stockToid=${+stockTo}&enteredquantity=${+quantity}&enteredbox=${+box}&itemid=${+itemId}&MaintenanceId=${+maintainanceId}`, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  availableQuantityEdit(stockFrom: number, stockTo: number, quantity: number, box: number, itemId: number, maintainanceId: number, receiveId: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Basic ' + JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.returnsUrl + `/AvailableQuantityEdit?stockfromid=${+stockFrom}&stockToid=${+stockTo}&enteredquantity=${+quantity}&enteredbox=${+box}&itemid=${+itemId}&MaintenanceId=${+maintainanceId}&RecieveId=${+receiveId}`, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }
  // print
  checkClientPrograms() {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.baseUrl + `/WebClientPrintAPL`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getDownloadLink() {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.baseUrl + `/DownloadApps`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  //http://localhost:50900/api/TestPrinter/PrintCode?ItemId=5&ItemName=يس&FacltyName=اى حاجه&LabName=اى
  printRequest(itemName: string, itemId: string, facltyname: string, labName: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    // return this.http.get(this.baseUrl + `/PrintZPL?printerName=${printerName}&Labname=${labname}&ItemId=${itemId}&Facltyname=${facltyname}&Language=${language}&Number=${numberPrints}`)
    //   .pipe(
    //     catchError(this.handleError)
      return this.http.get(this.baseUrl + `/TestPrinter/PrintCode?ItemId=${itemId}&ItemName=${itemName}&FacltyName=${facltyname}&LabName=${labName}`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllItemsPrinter(pageNum: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.baseUrl + `/TestPrinter/GetAllItemsPrint?pageNumber=${pageNum}&pageRowCount=10`,  {headers : headers})
      .pipe(
        catchError(this.handleError)
      );
  }
  searchItems( pageNo: number, name: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization','Basic '+ JSON.parse(sessionStorage.getItem('currentUser')).Message);
    return this.http.get(this.baseUrl + `/TestPrinter/GetAllItemsPrintSearch?pageNumber=${pageNo}&pageRowCount=10&ItemName=${name}`
    ,  {headers : headers}
    ).pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
   return throwError(
      'Something bad happened; please try again later.');
  }
    //login
    login(username: string, password: string) {
      return this.http.post(this.LoginUrl+'/UserLoginFunction', {UserName:username,Passward:password}
      ).pipe(map((user: any) => {
        if(user.Status=="Success")
        {
          //هنا الاساااااااااس
          if (user && user.Message) {
           
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            // this.currentUserSubject.next(user);
            this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')).Message);
            this.currentUser = this.currentUserSubject.asObservable();
            // this.currentUserNameStore.next(user);
          }
        }
     
        return user;
    })
    );
  }
}
