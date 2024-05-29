import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {BsLocaleService} from 'ngx-bootstrap';
import {RequestsService} from '../../../services/requests.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IDamage} from '../../../interfaces/Damage';
declare var $: any 
@Component({
  selector: 'app-damage',
  templateUrl: './damage.component.html',
  styleUrls: ['./damage.component.css']
})
export class DamageComponent implements OnInit {
  today = new Date();
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  allDamage;
  selectedItem: IDamage;
  itemDetails: any;
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  storeFromPageNum = 1;
  allStoresFrom;
  dataLengthFrom: number;
  notFound: boolean;
  loadingFrom = false;
  dropdownSettings = {};
  currentIndex: number;
  keywordFrom: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  zerosRow = -1;
  private disabledOption: {};
  errorRows = [];
  damageId: number;
  damageName: any;
  damageData: any;
  currentEditableRow = 0;
  constructor(public translate: TranslateService, private title: Title
            , private toastr: ToastrService,
              private localeService: BsLocaleService,
              private request: RequestsService,
              private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.translate.get('header.links.damage.title').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getAllDamage(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.allDamage = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
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
    if (this.translate.currentLang === 'en') {
      this.request.stocksToEnDamage(this.storeFromPageNum).subscribe((allStores: any) => {
        this.allStoresFrom = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.stocksToDamage(this.storeFromPageNum).subscribe((allStores: any) => {
        this.allStoresFrom = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
    this.addItemForm = this.fb.group({
      DamageOrderName: ['', Validators.required],
      DamageOrderDate: ['', Validators.required],
      DamageData: this.fb.array([this.createItem()])
    });
  }
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      this.request.getAllSupplies(++this.pageNum, this.deleteNo).subscribe(allItems => {
          this.dataLength -= (allItems as any).m_Item1.length;
          this.allowScroll = this.dataLength > 0;
          this.allDamage = (
            {
              m_Item1: this.allDamage.m_Item1.concat((allItems as any).m_Item1),
              m_Item2: (allItems as any).m_Item2
            }
          );
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }, () => this.spinnerMoreData = false
      );
    }
  }
  sort(current) {
    $('th span i').each((i, v) => {
      if ($(current).index() !== i) {
        $(v).removeClass('fa-sort-up');
        $(v).removeClass('fa-sort-down');
      }
    });
    const sortType = $(current).find('span i');
    if (sortType.hasClass('fa-sort-up')) {
      sortType.removeClass('fa-sort-up');
      sortType.addClass('fa-sort-down');
    } else {
      sortType.removeClass('fa-sort-down');
      sortType.addClass('fa-sort-up');
    }

  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  deleteItem() {
    if (this.selectedItem) {
      this.request.deleteDamageItem(this.selectedItem.DamageOrderId).subscribe(value => {
          this.allDamage.m_Item1 = this.allDamage.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.allDamage.m_Item2 = this.allDamage.m_Item2 - 1;
          this.deleteNo++;
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }
  createItem() {
    return this.fb.group( {
      DamageOrderId_FK: this.fb.control(''),
      ItemsId_FK: this.fb.control(''),
      ItemsCode: this.fb.control('', Validators.required),
      ItemsName: this.fb.control(''),
      StockId_FK: this.fb.control([], Validators.required),
      StockName_To_FK: this.fb.control(''),
      DamageOrderQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      DamageOrderQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
    });
  }
  get damageItems() {
    return this.addItemForm.get('DamageData') as FormArray;
  }
  editItem(id: number | string) {
    this.resetForm();
    const itemDetailsArr = [];
    this.request.getDamage(+id).subscribe((item: any) => {
      this.itemDetails = item[0];
      this.damageId = item[0].DamageOrderId;
      this.damageData = item[0].DamageOrderDate;
      this.damageName = item[0].DamageOrderName;
      for (let i = 0; i < item.length; i++) {
        itemDetailsArr.push({
          ItemsCode: item[i].ItemsCode,
          ItemsId_FK: item[i].ItemsId,
          ItemsName: item[i].ItemsName,
          StockId_FK: [[{
            value: item[i].StockIdFrom,
            label: this.translate.currentLang === 'ar' ? item[i].StockFromNameAr : item[i].StockFromNameEn
          }]],
          DamageOrderQuantityBox: item[i].DamageOrderBox,
          DamageOrderQuantityNumber: item[i].DamageOrderQuantity,
        });
      }
      this.addItemForm.patchValue({
        DamageOrderName:  this.damageName,
        DamageOrderDate: new Date(this.damageData),
        DamageData: itemDetailsArr
      });
      for (let i = 0; i < itemDetailsArr.length; i++) {
        this.damageItems.push(this.fb.group(itemDetailsArr[i]));
      }
      this.addMoreItems();
    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });


  }
  addMoreItems() {
    this.damageItems.push(this.createItem());
  }

  resetForm() {
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

  }
  onSearchTo(evt: any, index) {
    this.keywordFrom = evt.target.value;
    this.storeFromPageNum = 1;
    if (this.keywordFrom.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksToDamage(this.storeFromPageNum , this.keywordFrom).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksToEnDamage(this.storeFromPageNum , this.keywordFrom).subscribe((allStores: any) => {
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

      if (this.translate.currentLang === 'en') {
        this.request.stocksToEnDamage(this.storeFromPageNum = 1).subscribe((allStores: any) => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.stocksToDamage(this.storeFromPageNum = 1).subscribe((allStores: any) => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }

  }
  loadMoreStockTo(event) {
    if ((this.dataLengthFrom > 0 && !this.loadingFrom) && event.endIndex === this.allStoresFrom.m_Item1.length - 1) {
      this.loadingFrom = true;
      if (this.translate.currentLang === 'ar') {
        if (this.keywordFrom && this.keywordFrom.trim() !== '') {
          this.request.searchStocksToDamage(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) => {
            this.dataLengthFrom -= allStores.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allStores.m_Item1);
            this.loadingFrom = false;
          });
        } else {
          this.request.stocksToDamage(++this.storeFromPageNum).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        }
      } else {
        if (this.keywordFrom && this.keywordFrom.trim() !== '') {
          this.request.searchStocksToEnDamage(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) => {
            this.dataLengthFrom -= allStores.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allStores.m_Item1);
            this.loadingFrom = false;
          });
        } else {
          this.request.stocksToEnDamage(++this.storeFromPageNum).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        }
      }



    }
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
    console.log(ele.value)
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
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsCode'].value = $event.ItemCode;
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsCode'].setValue($event.ItemCode);
    this.addItemForm.get('DamageData')['controls'][this.currentIndex].controls['ItemsName'].value = $event.ItemName;
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

      this.request.updateDamage({
        DamageId: this.damageId,
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
            this.translate.currentLang === 'en' ? this.success('Damage updated successfully') : this.success('تم تعديل محضر الهالك بنجاح');
            this.resetForm();
            this.allDamage.m_Item1[this.currentEditableRow] = value.m_Item3[0];
            $('#edit-item').modal('hide');
          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }


}
