import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
declare var $: any 

@Component({
  selector: 'app-add-maintenance',
  templateUrl: './add-maintenance.component.html',
  styleUrls: ['./add-maintenance.component.css']
})
export class AddMaintenanceComponent implements OnInit {
  today = new Date();
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  storeFromPageNum = 1;
  totalStoreFromPageNum = 1;
  totalStoreToPageNum = 1;
  storeToPageNum = 1;
  allStoresFrom;
  totalStoresFrom;
  totalStoresTo;
  allStoresTo;
  dataLengthFrom: number;
  totlaDataLengthFrom: number;
  totlaDataLengthTo: number;
  dataLengthTo: number;
  notFound: boolean;
  maintainaceName: any;
  loadingFrom = false;
  loadingTo = false;
  dropdownSettings = {};
  currentIndex: number;
  keywordFrom: string;
  keywordTo: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  zerosRow = -1;
  sameStore = -1;
  private disabledOption: {};
  errorRows = [];
  constructor(public translate: TranslateService, private title: Title,
              private localeService: BsLocaleService, private fb: FormBuilder,
              private toastr: ToastrService, private request: RequestsService) { }

  ngOnInit() {
    this.translate.get('header.links.maintenance.add').subscribe(value => this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getNextMaintainaceName().subscribe(value => this.maintainaceName = value,
      error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
    if (this.translate.currentLang === 'en') {
      this.request.stocksMaintainaceEn(this.storeFromPageNum).subscribe((allStores: any) => {
        this.allStoresFrom = allStores;
        this.totalStoresFrom = allStores;
        this.totalStoresTo = allStores;
        this.allStoresTo = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        this.totlaDataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        this.totlaDataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.stocksMaintainace(this.storeFromPageNum).subscribe((allStores: any) => {
        this.allStoresFrom = allStores;
        this.totalStoresFrom = allStores;
        this.totalStoresTo = allStores;
        this.allStoresTo = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        this.totlaDataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        this.totlaDataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ? 'اختر المخزن' : 'Choose Store',
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
    this.addItemForm = this.fb.group({
      maintenaceName: [this.maintainaceName],
      maintenanceDate: [this.today, Validators.required],
      itemsDetails: this.fb.array([this.createItem()])
    });
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  get maintainaceItems() {
    return this.addItemForm.get('itemsDetails') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      ItemsId_FK: this.fb.control(''),
      ItemsCode_FK: this.fb.control('', Validators.required),
      StockId_From_FK: this.fb.control([], Validators.required),
      StockName_From_FK: this.fb.control(''),
      StockId_To_FK: this.fb.control([], Validators.required),
      StockName_To_FK: this.fb.control(''),
      maintenanceOrderQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      maintenanceOrderQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
    });
  }
  loadMoreStockFrom(event: any) {
    if ((this.dataLengthFrom > 0 && !this.loadingFrom) && event.endIndex === this.allStoresFrom.m_Item1.length - 1) {
      this.loadingFrom = true;
      if (this.keywordFrom && this.keywordFrom.trim() !== '') {
        if (this.translate.currentLang === 'ar') {
          this.request.searchStocksMaintainace(++this.storeFromPageNum, this.keywordFrom).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        } else {
          this.request.searchStocksMaintainaceEn(++this.storeFromPageNum, this.keywordFrom).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        }
      } else {
        if (this.translate.currentLang === 'ar') {
          this.request.stocksMaintainace(++this.storeFromPageNum).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.dataLengthTo -= allItems.m_Item1.length;
            this.totlaDataLengthFrom = this.dataLengthFrom;
            this.totlaDataLengthTo = this.dataLengthFrom;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.totalStoresFrom = this.allStoresFrom;
            this.totalStoresTo = this.allStoresFrom;
            this.totalStoreFromPageNum = this.storeFromPageNum;
            this.totalStoreToPageNum = this.storeFromPageNum;
            this.loadingFrom = false;
          });
        } else {
          this.request.stocksMaintainaceEn(++this.storeFromPageNum).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.dataLengthTo -= allItems.m_Item1.length;
            this.totlaDataLengthFrom = this.dataLengthFrom;
            this.totlaDataLengthTo = this.dataLengthFrom;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.totalStoresFrom = this.allStoresFrom;
            this.totalStoresTo = this.allStoresFrom;
            this.totalStoreFromPageNum = this.storeFromPageNum;
            this.totalStoreToPageNum = this.storeFromPageNum;
            this.loadingFrom = false;
          });
        }

      }


    }
  }
  onSearch(evt: any, index) {
    this.keywordFrom = evt.target.value;
    this.storeFromPageNum = 1;
    if (this.keywordFrom.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksMaintainace(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksMaintainaceEn(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        });
      }
    } else {
        $('.lazyContainer').eq(index).css('height', '300px');
        this.allStoresFrom = this.totalStoresFrom;
        this.dataLengthFrom = this.totlaDataLengthFrom;
        this.storeFromPageNum = this.totalStoreFromPageNum;
    }

  }
  onSearchTo(evt: any, index) {
    this.keywordTo = evt.target.value;
    this.storeToPageNum = 1;
    if (this.keywordTo.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksMaintainace(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksMaintainaceEn(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
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
      $('.lazyContainer').eq(index).css('height', '300px');
      this.allStoresTo = this.totalStoresTo;
      this.dataLengthTo = this.totlaDataLengthTo;
      this.storeToPageNum = this.totalStoreToPageNum;

    }
  }
  loadMoreStockTo(event) {
    if ((this.dataLengthTo > 0 && !this.loadingTo) && event.endIndex === this.allStoresTo.m_Item1.length - 1) {
      this.loadingTo = true;
      if (this.translate.currentLang === 'ar') {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksMaintainace(++this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksMaintainace(++this.storeToPageNum).subscribe((allItems: any) => {

            this.dataLengthTo -= allItems.m_Item1.length;
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.totlaDataLengthTo = this.dataLengthTo;
            this.totlaDataLengthFrom = this.dataLengthTo;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.totalStoresTo = this.allStoresTo;
            this.totalStoresFrom = this.allStoresTo;
            this.totalStoreToPageNum = this.storeToPageNum;
            this.totalStoreFromPageNum = this.storeToPageNum;
            this.loadingTo = false;
          });
        }
      } else {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksMaintainaceEn(++this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksMaintainaceEn(++this.storeToPageNum).subscribe((allItems: any) => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.totlaDataLengthTo = this.dataLengthTo;
            this.totlaDataLengthFrom = this.dataLengthTo;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.totalStoresTo = this.allStoresTo;
            this.totalStoresFrom = this.allStoresTo;
            this.totalStoreToPageNum = this.storeToPageNum;
            this.totalStoreFromPageNum = this.storeToPageNum;
            this.loadingTo = false;
          });
        }
      }



    }
  }
  resetForm() {
    this.duplicatedItem = -1;
    this.notFound = false;
    this.errorRow = -1;
    this.zerosRow = -1;
    this.sameStore = -1;
    this.errorRows = [];
    while (this.maintainaceItems.length > 0) {
      this.maintainaceItems.removeAt(0);
    }
    this.addItemForm.get('maintenanceDate').setValue(this.today);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
    this.addMoreItems();


  }
  addMoreItems() {
    this.maintainaceItems.push(this.createItem());
  }
  removeItem(index) {
    if (index === this.duplicatedItem) {
      this.duplicatedItem = -1;
      this.errorRow = -1;
    }
    if (index === this.sameStore) {
      this.sameStore = -1;
      this.errorRow = -1;
    }
    if (index === this.zerosRow) {
      this.zerosRow = -1;
      this.errorRow = -1;

    }
    if (index === this.errorRow) {
      this.errorRow = -1;
    }

    if (index === this.maintainaceItems.length - 1) {
      this.addMoreItems();
    }
    if (this.errorRows.includes(index)) {
      this.errorRows = this.errorRows.filter(value => value !== index);
    }
    this.maintainaceItems.removeAt(index);
    if (this.maintainaceItems.length === 0) {
      this.notFound = false;
      this.duplicatedItem = -1;
      this.sameStore = -1;
      this.errorRow = -1;
      this.zerosRow = -1;
      this.errorRows = [];
    }
  }
  addItemSubmit() {
    if (!this.maintainaceItems.controls[this.maintainaceItems.controls.length - 1].get('ItemsId_FK').value && this.maintainaceItems.length > 1) {
      this.maintainaceItems.removeAt(this.maintainaceItems.length - 1 );
    }
    for (let i = 0; i < this.maintainaceItems.length; i++) {
      if (this.maintainaceItems.controls[i].get('maintenanceOrderQuantityBox').value <= 0 && this.maintainaceItems.controls[i].get('maintenanceOrderQuantityNumber').value <= 0) {
        this.errorRows.push(i);
        if (this.translate.currentLang === 'ar') {
          this.error('لابد ان تكون الكميه اكبر من صفر');
        } else {
          this.error('The quantity must be greater than zero');
        }
      }
    }
    if (!this.notFound && this.duplicatedItem === -1 && this.sameStore === -1  && this.addItemForm.valid && this.errorRow === -1 && this.zerosRow === -1 && this.errorRows.length === 0) {
      const maintainaces = [];
      this.errorRows = [];
      for (let i = 0; i < this.addItemForm.get('itemsDetails').value.length; i++) {
        maintainaces.push({
          ItemsId_FK: this.addItemForm.get('itemsDetails').value[i].ItemsId_FK,
          StockId_From_FK: this.addItemForm.get('itemsDetails').value[i].StockId_From_FK[0].value,
          StockId_To_FK: this.addItemForm.get('itemsDetails').value[i].StockId_To_FK[0].value,
          maintenanceOrderQuantityBox: this.addItemForm.get('itemsDetails').value[i].maintenanceOrderQuantityBox,
          maintenanceOrderQuantityNumber: this.addItemForm.get('itemsDetails').value[i].maintenanceOrderQuantityNumber
        });
      }
      const dateTime = new Date(this.addItemForm.get('maintenanceDate').value);

      this.request.addMaintainance({
        MaintenaceName: this.maintainaceName,
        MaintenaceDate: dateTime.toDateString(),
        value: maintainaces,
      }).subscribe((value: any) => {
          if (value.m_Item1 !== true) {
            for (let i = 0; i < value.m_Item2.length; i++) {
              const current = value.m_Item2[i];
              for (let j = 0; j < maintainaces.length; j++) {
                if (current.m_Item1 === maintainaces[j].ItemsId_FK && current.m_Item2 === maintainaces[j].StockId_From_FK && current.m_Item3 === maintainaces[j].StockId_To_FK) {
                  this.errorRows.push(j);
                }
              }
            }
            if (this.errorRows.length > 0) {
              this.translate.currentLang === 'en' ? this.error('The required quantity does not exist') : this.error('الكميه المطلوبه غير موجوده');
            }
          } else {
            this.translate.currentLang === 'en' ? this.success('Maintenanace added successfully') : this.success('تم اضافه محضر الصيانه بنجاح');
            this.resetForm();
            this.request.getNextMaintainaceName().subscribe(val => this.maintainaceName = val,
              error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
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
  checkStoreFromValue(ele, index) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
    this.currentEditIndex = index;
  }
  getItemName(itemCode: number | string, element, nextElement) {
    const stockFrom = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_From_FK'];
    const stockId = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_To_FK'];
    const numberQuantity = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['maintenanceOrderQuantityNumber'];
    const box = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['maintenanceOrderQuantityBox'];
    if (stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0) {
      stockFrom.value = [];
      stockFrom.setValue([]);
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
          if (this.duplicatedItem === this.currentEditIndex) {
            this.duplicatedItem = -1;
          }
          if (this.zerosRow === this.currentEditIndex) {
            this.zerosRow = -1;
          }
          if (this.errorRow === this.currentEditIndex) {
            this.errorRow = -1;
          }
          if (this.sameStore === this.currentEditIndex) {
            this.sameStore = -1;
          }
          if (this.errorRows.includes(this.currentEditIndex)) {
            this.errorRows = this.errorRows.filter(val => val !== this.currentEditIndex);
          }
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
  focusStockFrom() {
    $('.c-btn').click();
  }
  focusStockTo() {
    $('.c-btn').click();

  }
  openSearchBar(index) {
    $('#search-container').removeClass('hidden');
    $('#inputSearch').focus();
    this.currentIndex = index;
  }
  getValue($event) {
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsId_FK'].value = $event.ItemId;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode_FK'].value = $event.ItemCode;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode_FK'].setValue($event.ItemCode);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['StockName_To_FK'].value = $event.ItemName;
    const stockFromId = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_From_FK'];
    const stockId = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_To_FK'];
    const numberQuantity = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['maintenanceOrderQuantityNumber'];
    const box = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['maintenanceOrderQuantityBox'];
    if (stockFromId.value.length !== 0 || stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0) {
      stockFromId.value = [];
      stockFromId.setValue([]);
      stockId.value = [];
      stockId.setValue([]);
      numberQuantity.value = 0;
      numberQuantity.setValue(0);
      box.value = 0;
      box.setValue(0);
      if (this.duplicatedItem === this.currentEditIndex) {
        this.duplicatedItem = -1;
      }
      if (this.zerosRow === this.currentEditIndex) {
        this.zerosRow = -1;
      }
      if (this.errorRow === this.currentEditIndex) {
        this.errorRow = -1;
      }
      if (this.sameStore === this.currentEditIndex) {
        this.sameStore = -1;
      }
      if (this.errorRows.includes(this.currentEditIndex)){
        this.errorRows = this.errorRows.filter(val => val !== this.currentEditIndex);
      }
    }
  }
  checkAvailabiltyQuantity(stockFromId: number, stockToId: number , boxNum: number, quantityNum: number, itemId: number, index: number) {
    this.zerosRow = (boxNum === 0 && quantityNum === 0) ? index : -1;
    if (this.duplicatedItem !== index && this.sameStore !== index && this.zerosRow === -1) {
      const boxTotal = this.mergeRows(itemId, stockFromId, stockToId, boxNum, quantityNum, index)[0];
      const quantityTotal = this.mergeRows(itemId, stockFromId, stockToId, boxNum, quantityNum, index)[1];
      this.request.checkAvailabilty(stockFromId, boxTotal, quantityTotal, itemId).subscribe((value: any) => {
        switch (value.result) {
          case null:
            this.errorRow = index;
            if (this.translate.currentLang === 'ar') {
              this.error(value.ErrorMessage);
            } else {
              this.error('The store does not have this product');

            }
            break;
          case false:
            this.errorRow = index;
            if (this.translate.currentLang === 'ar') {
              this.error(value.ErrorMessage + ' الكميه المتاحه ' + value.QuantityAvailable + ' عنصر' );
            } else {
              this.error('The store does not have this quantity the available is' + value.QuantityAvailable + ' item' );
            }
            break;
          default:
            if (this.errorRow === index) {
              this.errorRow = -1;
            }
            if (this.errorRows.includes(index)) {
              this.errorRows = this.errorRows.filter(val => val !== index);
            }
            if (this.duplicatedItem === -1 && this.sameStore === -1 && this.addItemForm.get('itemsDetails')['controls'][this.maintainaceItems.length - 1].controls['ItemsId_FK'].value && !this.notFound && this.errorRow === -1 && this.errorRows.length === 0) {
              this.addMoreItems();
            }
            break;

        }
      }, error => {
        if (this.translate.currentLang === 'ar') {
          this.error('حدث خطأ غير متوقع');
        } else {
          this.error(error);

        }
      });
    }
    if (this.zerosRow !== -1) {
      if (this.translate.currentLang === 'ar') {
        this.error('لابد ان تكون الكميه اكبر من صفر');
      } else {
        this.error('The quantity must be greater than zero');
      }
    }

  }
  checkDuplicated(stockFrom: number, stockTo: number, itemId: number, limit: number, boxNum: number, quantityNum: number) {
    this.sameStore = -1;
    if (stockFrom === stockTo) {
      this.sameStore = limit;
      if (this.translate.currentLang === 'ar') {
        this.error('لا يمكن التحويل من والي نفس المخزن');
      } else {
        this.error('Cannot transfer to and from the same store');
      }
      return;
    }
    this.duplicatedItem = -1;
    for (let i = 0; i < this.maintainaceItems.length; i++) {
      if (this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_From_FK'].value.length !== 0 && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value.length !== 0) {
        if (limit !== i && itemId === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && stockFrom === this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_From_FK'].value[0].value && stockTo === this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value[0].value) {
          this.duplicatedItem = limit;
          if (this.translate.currentLang === 'ar') {
            this.error('هذا الصنف لا يمكن ان يحول لنفس المخزن اكثر من مره');
          } else {
            this.error('This item can not be transformed to the same stock');
          }
        }
      }

    }
    if (this.duplicatedItem === -1 && this.sameStore === -1 && (boxNum > 0 || quantityNum > 0)) {
      this.checkAvailabiltyQuantity(stockFrom, stockTo, boxNum, quantityNum, itemId, limit);
    }
  }
  mergeRows(itemId: number, stockFrom: string| number, stockTo: string| number, boxNum: number, quantityNum: number, index: number) {
    let boxNumBefore = boxNum;
    let quantityNumBefore = quantityNum;
    for (let i = 0; i < this.maintainaceItems.length; i++) {
      if (this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_From_FK'].value.length !== 0) {
        if (index !== i && itemId === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && stockFrom !== this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_From_FK'].value[0].value && stockTo !== this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value[0].value) {
          boxNumBefore += this.addItemForm.get('itemsDetails')['controls'][i].controls['maintenanceOrderQuantityBox'].value;
          quantityNumBefore += this.addItemForm.get('itemsDetails')['controls'][i].controls['maintenanceOrderQuantityNumber'].value;
        }
      }
    }
    return [boxNumBefore, quantityNumBefore];
  }


}
