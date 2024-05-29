import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
declare var $: any 
@Component({
  selector: 'app-add-damage',
  templateUrl: './add-damage.component.html',
  styleUrls: ['./add-damage.component.css']
})
export class AddDamageComponent implements OnInit {
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  storeToPageNum = 1;
  allStoresTo;
  dataLengthTo: number;
  allowScrollTo = true;
  notFound: boolean;
  today = new Date();
  damageName: any;
  loadingTo = false;
  dropdownSettings = {};
  currentIndex: number;
  keywordTo: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  zerosRow = -1;
  private disabledOption: {};
  errorRows = [];

  constructor(public translate: TranslateService, private title: Title,
              private localeService: BsLocaleService, private fb: FormBuilder,
              private toastr: ToastrService,  private request: RequestsService) { }

  ngOnInit() {
    this.translate.get('header.links.damage.add').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getNextDamageName().subscribe(value => this.damageName = value,
      error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
    this.addItemForm = this.fb.group({
      DamageOrderName: [this.damageName],
      DamageOrderDate: [this.today, Validators.required],
      DamageData: this.fb.array([this.createItem()])
    });
    if (this.translate.currentLang === 'en') {
      this.request.stocksToEnDamage(this.storeToPageNum).subscribe((allStores: any) => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.stocksToDamage(this.storeToPageNum).subscribe((allStores: any) => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
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
  get damageItems() {
    return this.addItemForm.get('DamageData') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      DamageOrderId_FK: this.fb.control(''),
      ItemsId_FK: this.fb.control(''),
      ItemsCode_FK: this.fb.control('', Validators.required),
      StockId_FK: this.fb.control([], Validators.required),
      StockName_To_FK: this.fb.control(''),
      DamageOrderQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      DamageOrderQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
    });
  }
  onSearchTo(evt: any, index) {
    this.keywordTo = evt.target.value;
    this.storeToPageNum = 1;
    if (this.keywordTo.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksToDamage(this.storeToPageNum , this.keywordTo).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksToEnDamage(this.storeToPageNum , this.keywordTo).subscribe((allStores: any) => {
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

      if (this.translate.currentLang === 'en') {
        this.request.stocksToEnDamage(this.storeToPageNum = 1).subscribe((allStores: any) => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.stocksToDamage(this.storeToPageNum = 1).subscribe((allStores: any) => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }

  }
  loadMoreStockTo(event) {
    if ((this.dataLengthTo > 0 && !this.loadingTo) && event.endIndex === this.allStoresTo.m_Item1.length - 1) {
      this.loadingTo = true;
      if (this.translate.currentLang === 'ar') {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksToDamage(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksToDamage(++this.storeToPageNum).subscribe((allItems: any) => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      } else {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksToEnDamage(this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.stocksToEnDamage(++this.storeToPageNum).subscribe((allItems: any) => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      }



    }
  }
  resetForm() {
    this.allowScrollTo = true;
    this.duplicatedItem = -1;
    this.notFound = false;
    this.errorRow = -1;
    this.zerosRow = -1;
    this.errorRows = [];

    while (this.damageItems.length > 0) {
      this.damageItems.removeAt(0);
    }
    this.addItemForm.get('DamageOrderDate').setValue(this.today);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();

    this.addMoreItems();
  }
  addMoreItems() {
    this.damageItems.push(this.createItem());
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

    if (index === this.damageItems.length - 1) {
      this.addMoreItems();
    }
    if (this.errorRows.includes(index)) {
      this.errorRows = this.errorRows.filter(value => value !== index);
    }

    this.damageItems.removeAt(index);
    if (this.damageItems.length === 0) {
      this.notFound = false;
      this.duplicatedItem = -1;
      this.errorRow = -1;
      this.zerosRow = -1;
      this.errorRows = [];

    }
  }
  focusStock() {
    $('.c-btn').click();
  }
  checkStoreValue(ele, index) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
    this.currentEditIndex = index;
  }
  getItemName(itemCode: number | string, element, nextElement) {
    const stockId = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['StockId_FK'];
    const numberQuantity = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['DamageOrderQuantityNumber'];
    const box = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['DamageOrderQuantityBox'];
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
          if (this.zerosRow === this.currentEditIndex) {
            this.zerosRow = -1;
          }
          if (this.errorRow === this.currentEditIndex) {
            this.errorRow = -1;
          }
          if (this.duplicatedItem === this.currentEditIndex) {
            this.duplicatedItem = -1;
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
  openSearchBar(index) {
    $('#search-container').removeClass('hidden');
    $('#inputSearch').focus();
    this.currentIndex = index;
  }
  getValue($event) {
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsId_FK'].value = $event.ItemId;
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsCode_FK'].value = $event.ItemCode;
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsCode_FK'].setValue($event.ItemCode);
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['StockName_To_FK'].value = $event.ItemName;
    const stockId = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['StockId_FK'];
    const numberQuantity = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['DamageOrderQuantityNumber'];
    const box = this.addItemForm.get('DamageData')['controls'][this.currentEditIndex].controls['DamageOrderQuantityBox'];
    if ( stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0) {
      stockId.value = [];
      stockId.setValue([]);
      numberQuantity.value = 0;
      numberQuantity.setValue(0);
      box.value = 0;
      box.setValue(0);
      if (this.zerosRow === this.currentEditIndex) {
        this.zerosRow = -1;
      }
      if (this.errorRow === this.currentEditIndex) {
        this.errorRow = -1;
      }
      if (this.duplicatedItem === this.currentEditIndex) {
        this.duplicatedItem = -1;
      }
      if (this.errorRows.includes(this.currentEditIndex)) {
        this.errorRows = this.errorRows.filter(val => val !== this.currentEditIndex);
      }
    }
  }
  checkAvailabiltyQuantity(stockFromId: number, boxNum: number, quantityNum: number, itemId: number, index: number) {
    this.zerosRow = (boxNum === 0 && quantityNum === 0) ? index : -1;
    if (this.duplicatedItem !== index && this.zerosRow === -1) {
      this.request.checkAvailableQuantity(stockFromId, quantityNum, boxNum , itemId).subscribe((value: any) => {
        if (!value.m_Item1) {
          this.errorRow = index;
          if (this.translate.currentLang === 'ar') {
            this.error('المخزن لا يحتوي علي هذه الكميه الموجود هو ' + value.m_Item2 + ' عنصر');
          } else {
            this.error('The store does not have this quantity the available is' + value.m_Item2 + ' item');
          }
        } else {
          if (this.errorRow === index) {
            this.errorRow = -1;
          }
          if (this.errorRows.includes(index)) {
            this.errorRows = this.errorRows.filter(val => val !== index);
          }
          if (this.duplicatedItem === -1  && this.addItemForm.get('DamageData')['controls'][this.damageItems.length - 1].controls['ItemsId_FK'].value && !this.notFound && this.errorRow === -1 && this.errorRows.length === 0) {
            this.addMoreItems();
          }
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
  checkDuplicated(stockFrom: number, itemId: number, limit: number, boxNum: number, quantityNum: number) {
    this.duplicatedItem = -1;
    for (let i = 0; i < this.damageItems.length; i++) {
      if (this.addItemForm.get('DamageData')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('DamageData')['controls'][i].controls['StockId_FK'].value.length !== 0 ) {
        if (limit !== i && itemId === this.addItemForm.get('DamageData')['controls'][i].controls['ItemsId_FK'].value && stockFrom === this.addItemForm.get('DamageData')['controls'][i].controls['StockId_FK'].value[0].value) {
          this.duplicatedItem = limit;
          if (this.translate.currentLang === 'ar') {
            this.error('هذا الصنف لا يمكن ان يحول لنفس المخزن اكثر من مره');
          } else {
            this.error('This item can not be transformed to the same stock');
          }
        }
      }

    }
    if (this.duplicatedItem === -1 && (boxNum > 0 || quantityNum > 0)) {
      this.checkAvailabiltyQuantity(stockFrom, boxNum, quantityNum, itemId, limit);
    }
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  addItemSubmit() {
    if (!this.damageItems.controls[this.damageItems.controls.length - 1].get('ItemsId_FK').value && this.damageItems.length > 1) {
      this.damageItems.removeAt(this.damageItems.length - 1 );
    }
    for (let i = 0; i < this.damageItems.length; i++) {
      if (this.damageItems.controls[i].get('DamageOrderQuantityBox').value <= 0 && this.damageItems.controls[i].get('DamageOrderQuantityNumber').value <= 0) {
        this.errorRows.push(i);
        if (this.translate.currentLang === 'ar') {
          this.error('لابد ان تكون الكميه اكبر من صفر');
        } else {
          this.error('The quantity must be greater than zero');
        }
      }
    }
    if (!this.notFound && this.duplicatedItem === -1 && this.addItemForm.valid && this.errorRow === -1 && this.zerosRow === -1 && this.errorRows.length === 0) {
      const damages = [];
      this.errorRows = [];
      for (let i = 0; i < this.addItemForm.get('DamageData').value.length; i++) {
        damages.push({
          ItemsId_FK: this.addItemForm.get('DamageData').value[i].ItemsId_FK,
          StockId_FK: this.addItemForm.get('DamageData').value[i].StockId_FK[0].value,
          DamageOrderQuantityBox: this.addItemForm.get('DamageData').value[i].DamageOrderQuantityBox,
          DamageOrderQuantityNumber: this.addItemForm.get('DamageData').value[i].DamageOrderQuantityNumber
        });
      }
      const dateTime = new Date(this.addItemForm.get('DamageOrderDate').value);

      this.request.addDamage({
        DamageOrderName: this.damageName,
        DamageOrderDate: dateTime.toDateString(),
        DamageDatalist: damages,
      }).subscribe((value: any) => {
          if (value.m_Item1 !== true) {
            for (let i = 0; i < value.m_Item2.length; i++) {
              const current = value.m_Item2[i];
              for (let j = 0; j < damages.length; j++) {
                if (current.m_Item1 === damages[j].ItemsId_FK && current.m_Item2 === damages[j].StockId_FK) {
                  this.errorRows.push(j);
                }
              }
            }
            if (this.errorRows.length > 0) {
              this.translate.currentLang === 'en' ? this.error('The required quantity does not exist') : this.error('الكميه المطلوبه غير موجوده');
            }
          } else {
            this.translate.currentLang === 'en' ? this.success('Damage added successfully') : this.success('تم اضافه محضر الهالك بنجاح');
            this.resetForm();
            this.request.getNextDamageName().subscribe(val => this.damageName = val,
              error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }
}
