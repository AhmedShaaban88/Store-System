import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsLocaleService} from 'ngx-bootstrap';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
declare var $: any 
@Component({
  selector: 'app-add-supply',
  templateUrl: './add-supply.component.html',
  styleUrls: ['./add-supply.component.css']
})
export class AddSupplyComponent implements OnInit {
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  storeToPageNum = 1;
  allStoresTo;
  dataLengthTo: number;
  allowScrollTo = true;
  empPageNum = 1;
  allEmp;
  dataLengthEmp: number;
  notFound: boolean;
  today = new Date();
  supplyName: any;
  loadingTo = false;
  loadingReciver = false;
  dropdownSettings = {};
  currentIndex: number;
  keywordTo: string;
  empKeyword: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  zerosRow = -1;
  private disabledOption: {};
  constructor(public translate: TranslateService, private title: Title,
              private localeService: BsLocaleService, private fb: FormBuilder,
              private request: RequestsService, private toastr: ToastrService) { }

  ngOnInit() {
    this.translate.get('header.links.supply.add').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getNextSupplyName().subscribe(value => this.supplyName = value,
      error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
    this.addItemForm = this.fb.group({
      SupplyOrderName: [this.supplyName],
      SupplyOrderDate: [this.today, Validators.required],
      SupplyDataObj: this.fb.array([this.createItem()])
    });
    if (this.translate.currentLang === 'en') {
      this.request.stocksToEnSupply(this.storeToPageNum).subscribe((allStores: any) => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.stocksToSupply(this.storeToPageNum).subscribe((allStores: any) => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
    this.request.getAllEmployee(this.empPageNum).subscribe((allEmp: any) => {
      this.allEmp = allEmp;
      this.dataLengthEmp = allEmp.m_Item2 - allEmp.m_Item1.length;
    }, error => {
      this.error('حدث خطأ غير متوقع');
    });
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر ' : 'Choose ',
      enableSearchFilter: true,
      lazyLoading: true,
      primaryKey: 'value',
      labelKey: 'label',
      classes: 'myclass custom-class',
      enableCheckAll: false,
      showCheckbox: true,
      noDataLabel: this.translate.currentLang === 'ar' ? 'لا يوجد نتائج' : 'No results found',
      disabled: false
    };
    this.disabledOption = {
      ...this.dropdownSettings,
      disabled: true
    };
  }
  get supplyItems() {
    return this.addItemForm.get('SupplyDataObj') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      ItemsId_FK: this.fb.control(''),
      ItemsCode_FK: this.fb.control('', Validators.required),
      StockId_FK: this.fb.control([], Validators.required),
      StockName_To_FK: this.fb.control(''),
      RecievedId_FK: this.fb.control([], Validators.required),
      RecievedName_To_FK: this.fb.control(''),
      SupplyQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      SupplyQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
    });
  }
  onSearchTo(evt: any, index) {
    this.keywordTo = evt.target.value;
    this.storeToPageNum = 1;
    if (this.keywordTo.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksToSupply(this.storeToPageNum , this.keywordTo).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksToEnSupply(this.storeToPageNum , this.keywordTo).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        });
      }

    } else {
      if (this.translate.currentLang === 'en') {
        $('.lazyContainer').eq(index).css('height', '0');
        this.request.stocksToEnSupply(this.storeToPageNum = 1).subscribe((allStores: any) => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.stocksToSupply(this.storeToPageNum = 1).subscribe((allStores: any) => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }

  }
  onSearchEmp(evt: any, index) {
    this.empKeyword = evt.target.value;
    this.empPageNum = 1;
    if (this.empKeyword.trim() !== '') {
        this.request.searchEmployee(this.empPageNum , this.empKeyword).subscribe((allItems: any) => {
          if (allItems.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allEmp = allItems;
          this.dataLengthEmp = allItems.m_Item2 - allItems.m_Item1.length;
        });


    } else {
        $('.lazyContainer').eq(index).css('height', '0');
        this.request.getAllEmployee(this.empPageNum = 1).subscribe((allItems: any) => {
          this.allEmp = allItems;
          this.dataLengthEmp = allItems.m_Item2 - allItems.m_Item1.length;
          $('.lazyContainer').eq(index).css('height', '300px');

        }, error => {
          this.error(error);
        });
    }

  }
  loadMoreStockTo(event) {
    if ((this.dataLengthTo > 0 && !this.loadingTo) && event.endIndex === this.allStoresTo.m_Item1.length - 1) {
      this.loadingTo = true;
      if(this.translate.currentLang === 'ar') {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksToSupply(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksToSupply(++this.storeToPageNum).subscribe((allItems: any) => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      } else {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksToEnSupply(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksToEnSupply(++this.storeToPageNum).subscribe((allItems: any) => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      }



    }
  }
  loadMoreEmp(event) {
    if ((this.dataLengthEmp > 0 && !this.loadingReciver) && event.endIndex === this.allEmp.m_Item1.length - 1) {
      this.loadingReciver = true;
        if (this.empKeyword && this.empKeyword.trim() !== '') {
          this.request.searchEmployee(++this.empPageNum, this.empKeyword).subscribe((allItems: any) => {
            this.dataLengthEmp -= allItems.m_Item1.length;
            this.allEmp.m_Item1 = this.allEmp.m_Item1.concat(allItems.m_Item1);
            this.loadingReciver = false;
          });
        } else {
          this.request.getAllEmployee(++this.empPageNum).subscribe((allItems: any) => {
            this.dataLengthEmp -= allItems.m_Item1.length;
            this.allEmp.m_Item1 = this.allEmp.m_Item1.concat(allItems.m_Item1);
            this.loadingReciver = false;
          });
        }


    }
  }
  resetForm() {
    this.allowScrollTo = true;
    this.duplicatedItem = -1;
    this.notFound = false;
    this.errorRow = -1;
    this.zerosRow = -1;
    while (this.supplyItems.length > 0) {
      this.supplyItems.removeAt(0);
    }
    this.addItemForm.get('SupplyOrderDate').setValue(this.today);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
      this.addMoreItems();
  }
  addMoreItems() {
    this.supplyItems.push(this.createItem());
  }
  removeItem(index) {
    if (index === this.duplicatedItem) {
      this.duplicatedItem = -1;
      this.errorRow = -1;
    }
    if (index === this.zerosRow) {
      this.zerosRow = -1;
      this.errorRow = -1;

    }
    if (index === this.errorRow) {
      this.errorRow = -1;
    }

    if (index === this.supplyItems.length - 1) {
      this.addMoreItems();
    }
    this.supplyItems.removeAt(index);
    if (this.supplyItems.length === 0) {
      this.notFound = false;
      this.duplicatedItem = -1;
      this.errorRow = -1;
      this.zerosRow = -1;
    }
  }
  addItemSubmit() {
    if (!this.supplyItems.controls[this.supplyItems.controls.length - 1].get('ItemsId_FK').value && this.supplyItems.length > 1) {
      this.supplyItems.removeAt(this.supplyItems.length - 1 );
    }
    for (let i = 0; i < this.supplyItems.length; i++) {
      if (this.supplyItems.controls[i].get('SupplyQuantityBox').value <= 0 && this.supplyItems.controls[i].get('SupplyQuantityNumber').value <= 0) {
        this.zerosRow = i;
        if (this.translate.currentLang === 'ar') {
          this.error('لابد ان تكون الكميه اكبر من صفر');
        } else {
          this.error('The quantity must be greater than zero');
        }
        break;
      }
    }

    if (!this.notFound && this.duplicatedItem === -1 && this.addItemForm.valid && this.errorRow === -1 && this.zerosRow === -1) {
      const supplies = [];
      for (let i = 0; i < this.addItemForm.get('SupplyDataObj').value.length; i++) {
        supplies.push({
          ItemsId_FK: this.addItemForm.get('SupplyDataObj').value[i].ItemsId_FK,
          StockId_FK: this.addItemForm.get('SupplyDataObj').value[i].StockId_FK[0].StockId,
          RecievedId_FK: this.addItemForm.get('SupplyDataObj').value[i].RecievedId_FK[0].value,
          SupplyQuantityBox: this.addItemForm.get('SupplyDataObj').value[i].SupplyQuantityBox,
          SupplyQuantityNumber: this.addItemForm.get('SupplyDataObj').value[i].SupplyQuantityNumber
        });
      }
      const dateTime = new Date(this.addItemForm.get('SupplyOrderDate').value);

      this.request.addSupply({
        SupplyOrderName: this.supplyName,
        SupplyOrderDate: dateTime.toDateString(),
        SupplyDataObj: supplies,
      }).subscribe((value: any) => {
          if (value !== true) {
            this.translate.currentLang === 'en' ? this.error('Something wrong happen') : this.error('حدث خطأ غير متوقع');

          } else {
            this.translate.currentLang === 'en' ? this.success('Supply added successfully') : this.success('تم اضافه سند التوريد بنجاح');
            this.request.getNextSupplyName().subscribe(val => this.supplyName = val,
              error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
            this.resetForm();

          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }
  checkStoreToValue(ele, index) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
    this.currentEditIndex = index;
  }
  focusEmp() {
    $('.c-btn').eq(1).click();

  }
  checkEmpValue(ele, index) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
    this.currentEditIndex = index;
  }
  focusStockTo() {
    $('.c-btn').eq(0).click();

  }
  getItemName(itemCode: number | string, element, nextElement) {
    const stockId = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['StockId_FK'];
    const numberQuantity = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['SupplyQuantityNumber'];
    const box = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['SupplyQuantityBox'];
    if (stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0) {
      stockId.value = [];
      stockId.setValue([]);
      numberQuantity.value = 0;
      numberQuantity.setValue(0);
      box.value = 0;
      box.setValue(0);
    }
    this.request.getItemName(itemCode).subscribe((value: any) => {
        if (value) {
          element.value = value.ItemId;
          element.setValue(value.ItemId);
          nextElement.value = value.ItemName;
          this.notFound = false;

        } else {
          this.notFound = true;
          element.value = '';
          element.setValue('');
          if (this.translate.currentLang === 'ar') {
            nextElement.value = 'لا يوجد';
          } else {
            nextElement.value = 'not found';
          }
        }
      },
      error1 => {
        if (this.translate.currentLang === 'ar') {
          this.error('حدث خطأ غير متوقع');
        } else {
          this.error(error1);
        }
      });
  }
  openSearchBar(index) {
    $('#search-container').removeClass('hidden');
    $('#inputSearch').focus();
    this.currentIndex = index;
  }
  getValue($event) {
    this.addItemForm.get('SupplyDataObj')['controls'][this.currentIndex].controls['ItemsId_FK'].value = $event.ItemId;
    this.addItemForm.get('SupplyDataObj')['controls'][this.currentIndex].controls['ItemsCode_FK'].value = $event.ItemCode;
    this.addItemForm.get('SupplyDataObj')['controls'][this.currentIndex].controls['ItemsCode_FK'].setValue($event.ItemCode);
    this.addItemForm.get('SupplyDataObj')['controls'][this.currentIndex].controls['StockName_To_FK'].value = $event.ItemName;
    const stockId = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['StockId_FK'];
    const empId = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['RecievedId_FK'];
    const numberQuantity = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['SupplyQuantityNumber'];
    const box = this.addItemForm.get('SupplyDataObj')['controls'][this.currentEditIndex].controls['SupplyQuantityBox'];
    if (stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0 || empId.value.length !== 0) {
      stockId.value = [];
      stockId.setValue([]);
      empId.value = [];
      empId.setValue([]);
      numberQuantity.value = 0;
      numberQuantity.setValue(0);
      box.value = 0;
      box.setValue(0);
    }
  }
  checkDuplicated(stockTo: string | number, itemId: number, limit: number) {
    this.duplicatedItem = -1;
    for (let i = 0; i < this.supplyItems.length; i++) {
      if (this.addItemForm.get('SupplyDataObj')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('SupplyDataObj')['controls'][i].controls['StockId_FK'].value.length !== 0) {
        if (limit !== i && itemId === this.addItemForm.get('SupplyDataObj')['controls'][i].controls['ItemsId_FK'].value && stockTo === this.addItemForm.get('SupplyDataObj')['controls'][i].controls['StockId_FK'].value[0].value) {
          this.duplicatedItem = limit;
          if (this.translate.currentLang === 'ar') {
            this.error('هذا الصنف لا يمكن ان يحول لنفس المخزن اكثر من مره');
          } else {
            this.error('This item can not be transformed to the same stock');
          }
        }
      }

    }
  }
  checkQuantity(boxNum: number, quantityNum: number, index: number) {
    this.zerosRow = (boxNum === 0 && quantityNum === 0) ? index : -1;
    if (this.zerosRow !== -1) {
      if (this.translate.currentLang === 'ar') {
        this.error('لابد ان تكون الكميه اكبر من صفر');
      } else {
        this.error('The quantity must be greater than zero');
      }
    }
  }
  addMoreRows() {
    if (!this.notFound && this.duplicatedItem === -1 && this.addItemForm.valid && this.errorRow === -1 && this.zerosRow === -1) {
      this.addMoreItems();
    } else {
      if (this.translate.currentLang === 'ar') {
        this.error('لابد ان من اكمال السند السابق ');
      } else {
        this.error('The last supply is not complete');
      }
    }
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }

}
