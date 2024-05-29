import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsLocaleService} from 'ngx-bootstrap';
import {ISupply} from '../../../interfaces/Supply';
declare var $: any 
@Component({
  selector: 'app-supply',
  templateUrl: './supply.component.html',
  styleUrls: ['./supply.component.css']
})
export class SupplyComponent implements OnInit {
  filter = false;
  search = false;
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  allSupplies;
  selectedItem: ISupply;
  itemDetails: any;
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  notFound: boolean;
  storeToPageNum = 1;
  empPageNum = 1;
  allStoresTo;
  dataLengthTo: number;
  dataLengthEmp: number;
  allowScrollTo = true;
  supplyId: number;
  loadingTo = false;
  loadingReciver = false;
  dropdownSettings = {};
  currentIndex: number;
  keywordTo: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  private disabledOption: {};
  zerosRow = -1;
  today = new Date();
  empKeyword: string;
  allEmp;
  currentEditableRow = 0;
  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder,  private localeService: BsLocaleService) { }

  ngOnInit() {
    this.translate.get('header.links.supply.title').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getAllSupplies(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.allSupplies = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
    this.addItemForm = this.fb.group({
      SupplyOrderName: ['', Validators.required],
      SupplyOrderDate: ['', Validators.required],
      SupplyDataObj: this.fb.array([])
    });
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر ' : 'Choose Store',
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
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      this.request.getAllSupplies(++this.pageNum, this.deleteNo).subscribe(allItems => {
          this.dataLength -= (allItems as any).m_Item1.length;
          this.allowScroll = this.dataLength > 0;
          this.allSupplies = (
            {
              m_Item1: this.allSupplies.m_Item1.concat((allItems as any).m_Item1),
              m_Item2: (allItems as any).m_Item2
            }
          );
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }, () => this.spinnerMoreData = false
      );
    }
  }
  get supplyItems() {
    return this.addItemForm.get('SupplyDataObj') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      ItemsId_FK: this.fb.control(''),
      ItemsCode_FK: this.fb.control('', Validators.required),
      StockId_FK: this.fb.control([], Validators.required),
      ItemsName: this.fb.control(''),
      RecievedId_FK: this.fb.control([], Validators.required),
      RecievedName_To_FK: this.fb.control(''),
      SupplyQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      SupplyQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
    });
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
      this.request.deleteSupplyItem(this.selectedItem.SupplyOrderId).subscribe(value => {
          this.allSupplies.m_Item1 = this.allSupplies.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.allSupplies.m_Item2 = this.allSupplies.m_Item2 - 1;
          this.deleteNo++;
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }
  editItem(id: number | string) {
    this.resetForm();
    const supplies = [];
    this.request.getSupply(+id).subscribe(item => {

      this.itemDetails = item[0];
      this.supplyId = this.itemDetails.SupplyOrderId;
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
      for (let i = 0; i < this.itemDetails.SupplyDetails.length; i++) {

        supplies.push({
          ItemsCode_FK: this.itemDetails.SupplyDetails[i].ItemCode,
          ItemsId_FK: this.itemDetails.SupplyDetails[i].ItemsId_FK,
          ItemsName: this.itemDetails.SupplyDetails[i].ItemsName,
          StockId_FK: [[{
            value: this.itemDetails.SupplyDetails[i].StockId_FK,
            label: this.translate.currentLang === 'ar' ? this.itemDetails.SupplyDetails[i].StockNameAr : this.itemDetails.SupplyDetails[i].StockNameEn
          }]],
          RecievedId_FK: [[{
            value: this.itemDetails.SupplyDetails[i].EmpId,
            label: this.itemDetails.SupplyDetails[i].EmpName
          }]],
          SupplyQuantityBox: this.itemDetails.SupplyDetails[i].Box,
          SupplyQuantityNumber: this.itemDetails.SupplyDetails[i].SupplyOrderItemsQuantity,
        });
      }
      this.addItemForm.patchValue({
        SupplyOrderName: this.itemDetails.SupplyOrderName,
        SupplyOrderDate: new Date(this.itemDetails.SupplyOrderDate),
        SupplyDataObj: supplies
      });
      for (let i = 0; i < supplies.length; i++) {
        this.supplyItems.push(this.fb.group(supplies[i]));
      }
    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });


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
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
  }
  addMoreItems() {
    this.supplyItems.push(this.createItem());
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
      if (this.translate.currentLang === 'ar') {
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
    this.addItemForm.get('SupplyDataObj')['controls'][this.currentIndex].controls['ItemsName'].value = $event.ItemName;
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
          StockId_FK: this.addItemForm.get('SupplyDataObj').value[i].StockId_FK[0].value,
          RecievedId_FK: this.addItemForm.get('SupplyDataObj').value[i].RecievedId_FK[0].value,
          SupplyQuantityBox: this.addItemForm.get('SupplyDataObj').value[i].SupplyQuantityBox,
          SupplyQuantityNumber: this.addItemForm.get('SupplyDataObj').value[i].SupplyQuantityNumber
        });
      }
      const dateTime = new Date(this.addItemForm.get('SupplyOrderDate').value);

      this.request.updateSupply({
        SupplyOrderId: this.supplyId,
        SupplyOrderName: this.itemDetails.SupplyOrderName,
        SupplyOrderDate: dateTime.toDateString(),
        SupplyDataObj: supplies,
      }).subscribe((value: any) => {
          if (value.result !== true) {
            this.translate.currentLang === 'en' ? this.error('Something wrong happen') : this.error('حدث خطأ غير متوقع');
          } else {
            this.translate.currentLang === 'en' ? this.success('Supply updated successfully') : this.success('تم تعديل السند بنجاح');
            this.resetForm();
            this.allSupplies.m_Item1[this.currentEditableRow] = value.Object[0];
            $('#edit-item').modal('hide');
          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }

}
