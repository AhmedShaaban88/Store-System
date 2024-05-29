import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../services/requests.service';
import {FormBuilder, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit {
  private dropdownSettings: {};
  items: any;
  prints: any;
  places: any;
  floors: any;
  offices: any;
  pageNumItems = 1;
  loadingItems = false;
  keywordItems: string;
  itemName: string;
  dataLengthItems: number;
  spinnerMoreData: boolean;
  lazyLoadabelDropDown;
  addItemForm = this.fb.group({
    printerName: [[], Validators.required],
    itemId: [[], Validators.required],
    PlaceId_FK: [[], Validators.required],
    FloorId_FK: [[], Validators.required],
    OfficeId_FK: [[], Validators.required],
    lang: ['', Validators.required],
    number: [1, Validators.compose([Validators.required, Validators.min(1)])],
  });
  constructor(public translate: TranslateService, private title: Title
             ,private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.translate.get('header.links.print.title').subscribe(value =>  this.title.setTitle(value));
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر ' : 'Choose ',
      enableSearchFilter: false,
      lazyLoading: false,
      primaryKey: 'value',
      labelKey: 'label',
      classes: 'myclass custom-class',
      enableCheckAll: false,
      showCheckbox: true,
      noDataLabel: this.translate.currentLang === 'ar' ? 'لا يوجد نتائج' : 'No results found',
      searchPlaceholderText: this.translate.currentLang === 'ar' ?  'كلمه البحث' : 'Search'
    };
    this.lazyLoadabelDropDown = {
      ...this.dropdownSettings,
      enableSearchFilter: true,
      lazyLoading: true,
    };
    this.loadAllItems();
    this.loadAllPlaces();
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  loadAllItems() {
    this.request.getAllItemsPrinter(this.pageNumItems).subscribe(allItems => {
      this.items = allItems;
      this.dataLengthItems = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
  }
  loadMoreItems(event: any) {
    if ((this.dataLengthItems > 0 && !this.loadingItems) && event.endIndex === this.items.m_Item1.length - 1) {
      this.loadingItems = true;
      if (this.keywordItems && this.keywordItems.trim() !== '') {
        this.request.searchItems(++this.pageNumItems, this.keywordItems).subscribe((allItems: any) => {
          this.dataLengthItems -= allItems.m_Item1.length;
          this.items.m_Item1 = this.items.m_Item1.concat(allItems.m_Item1);
          this.loadingItems = false;
        });
      } else {
        this.request.getAllItemsPrinter(++this.pageNumItems).subscribe(allItems => {
          this.dataLengthItems -= allItems.m_Item1.length;
          this.items.m_Item1 = this.items.m_Item1.concat(allItems.m_Item1);
          this.loadingItems = false;
        });

      }


    }
  }
  onSearch(evt: any) {
    this.keywordItems = evt.target.value;
    this.pageNumItems = 1;
    if (this.keywordItems.trim() !== '') {
      this.request.searchItems(this.pageNumItems, this.keywordItems).subscribe((allItems: any) =>{
        if (allItems.m_Item2 === 0) {
          $('.lazyContainer').eq(1).css('height', '0');
        } else {
          $('.lazyContainer').eq(1).css('height', '300px');
        }
        this.items = allItems;
        this.dataLengthItems = allItems.m_Item2 - allItems.m_Item1.length;
      });
    } else {
      $('.lazyContainer').eq(1).css('height', '300px');
      this.request.getAllItemsPrinter(this.pageNumItems).subscribe(allItems => {
        this.items = allItems;
        this.dataLengthItems = allItems.m_Item2 - allItems.m_Item1.length;
      }, error => {
        this.error(error);
      });
    }

  }
  loadAllPlaces() {
    this.addItemForm.reset();
      if(this.translate.currentLang === 'en') {
        this.request.getAllPlacesEn().subscribe(allPlaces => {
          this.places = allPlaces;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllPlaces().subscribe(allPlaces => {
          this.places = allPlaces;

        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
    }
  }
  changeFaculty(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getFloorInPlaceEn(id).subscribe(allFloors => {
        this.floors = allFloors;
        this.addItemForm.get('OfficeId_FK').setValue('');
        this.offices = undefined;

      }, error => {
        this.error(error);
      });
    } else {
      this.request.getFloorInPlace(id).subscribe(allFloors => {
        this.floors = allFloors;
        this.addItemForm.get('OfficeId_FK').setValue('');
        this.offices = undefined;

      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }

  }
  changeFloor(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getOfficeInFloorEn(id).subscribe(allOffices => {
        this.addItemForm.patchValue({
          OfficeId_FK: ''
        });
        this.offices = allOffices;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.getOfficeInFloor(id).subscribe(allOffices => {
        this.addItemForm.patchValue({
          OfficeId_FK: ''
        });
        this.offices = allOffices;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }

  }
  addItemSubmit() {

    this.request.printRequest(this.itemName, this.addItemForm.get('itemId').value[0].value, this.addItemForm.get('PlaceId_FK').value[0].value, this.addItemForm.get('OfficeId_FK').value[0].value).
      subscribe(value => console.log(value));
    // this.request.addStock({
    //   StockNameAr: this.addItemForm.get('StockNameAr').value,
    //   StockNameEn: this.addItemForm.get('StockNameEn').value,
    //   StockTypeId_FK: this.addItemForm.get('StockTypeId_FK').value[0].value,
    //   PlaceId_FK: this.addItemForm.get('OfficeId_FK').value[0].value,
    // }).subscribe(value => {
    //     this.translate.currentLang === 'en' ? this.success('store added successfully') : this.success('تم اضافه المخزن بنجاح');
    //     if (this.stocks.m_Item1.length % 10 === 0) {
    //       this.stocks.m_Item1.pop();
    //     } else {
    //       this.stocks.m_Item2++;
    //
    //     }
    //     this.stocks.m_Item1 = [
    //       value[0],
    //       ...this.stocks.m_Item1
    //     ];
    //
    //
    //   }, error => {
    //     this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    //   }
    // );
   // this.addItemForm.reset();
  }
  focusPrint() {
    $('.c-btn').eq(0).click();
  }
  checkPrintValueAdd(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors.empty = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusItems() {
    $('.c-btn').eq(1).click();
  }
  checkItemsValueAdd(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors.empty = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusPlaceAdd() {
    $('.c-btn').eq(2).click();
  }
  checkPlaceValueAdd(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors.empty = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusFloorAdd() {
    $('.c-btn').eq(3).click();
  }
  checkFloorValueAdd(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors.empty = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusOfficeAdd() {
    $('.c-btn').eq(4).click();
  }
  checkOfficeValueAdd(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors.empty = 'empty';
    } else {
      ele.errors = null;
    }


  }

}
