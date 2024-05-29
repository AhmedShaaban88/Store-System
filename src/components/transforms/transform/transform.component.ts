import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {ITransformation} from '../../../interfaces/Transformation';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsLocaleService} from 'ngx-bootstrap';
//import * as bootstrap from "bootstrap"; import * as $ from 'jquery';
declare var $: any ;
@Component({
  selector: 'app-transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.css']
})
export class TransformComponent implements OnInit {
  filter = false;
  search = false;
  transformations;
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  selectedItem: ITransformation;
  itemDetails: any;
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  notFound: boolean;
  currentStoreFrom: number | string;
  storeFromPageNum = 1;
  storeToPageNum = 1;
  allStoresFrom;
  allStoresTo;
  dataLengthFrom: number;
  dataLengthTo: number;
  allowScrollTo = true;
  transformationOrderId: number;
  loadingFrom = false;
  loadingTo = false;
  dropdownSettings = {};
  visitedFromStock = false;
  currentIndex: number;
  keywordFrom: string;
  keywordTo: string;
  currentEditIndex = 0;
  duplicatedItem = -1;
  errorRow = -1;
  private disabledOption: {};
  errorRows = [];
  prevStoreFrom: number | string;
  prevStoreFromObj: any;
  currentStoreFromObj: any;
  zerosRow = -1;
  currentEditableRow = 0;

  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder,  private localeService: BsLocaleService  ) { }

  ngOnInit() {
    this.translate.get('header.links.transform.title').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);

    this.request.getAllTransformations(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.transformations = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
    this.addItemForm = this.fb.group({
      transformPermissionName: ['', Validators.required],
      stockIdFrom: [[], Validators.required],
      transformPermissionDate: ['', Validators.required],
      itemsDetails: this.fb.array([])
    });
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر المخزن' : 'Choose Store',
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
      this.request.getAllTransformations(++this.pageNum, this.deleteNo).subscribe(allItems => {
          this.dataLength -= (allItems as any).m_Item1.length;
          this.allowScroll = this.dataLength > 0;
          this.transformations = (
            {
              m_Item1: this.transformations.m_Item1.concat((allItems as any).m_Item1),
              m_Item2: (allItems as any).m_Item2
            }
          );
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }, () => this.spinnerMoreData = false
      );
    }
  }
  deleteItem() {
    if (this.selectedItem) {
      this.request.deleteTransformation(this.selectedItem.TransformPermissionId).subscribe(value => {
          this.transformations.m_Item1 = this.transformations.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.transformations.m_Item2 = this.transformations.m_Item2 - 1;
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
    const itemDetailsArr = [];
    this.request.getTransformation(+id).subscribe(item => {
      this.itemDetails = item[0];
      this.currentStoreFromObj = [{
        value: this.itemDetails.StockIdFrom,
        label: this.translate.currentLang === 'ar' ? this.itemDetails.StockFromNameAr : this.itemDetails.StockFromNameEn
      }];
      this.transformationOrderId = this.itemDetails.TransformPermissionId;
      if (this.translate.currentLang === 'en') {
        this.request.getTransformationFromStoreEn(this.storeFromPageNum).subscribe(allStores => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.getTransformationFromStoreEditMode(this.itemDetails.StockIdFrom, this.storeFromPageNum).subscribe(allStores => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
      for (let i = 0; i < this.itemDetails.ItemsDetails.length; i++) {

        itemDetailsArr.push({
          ItemsCode: this.itemDetails.ItemsDetails[i].ItemsCode,
          ItemsId_FK: this.itemDetails.ItemsDetails[i].ItemsId_FK,
          ItemsName: this.itemDetails.ItemsDetails[i].ItemsName,
          StockId_To_FK: [[{
            value: this.itemDetails.ItemsDetails[i].StockId_To_FK,
            label: this.translate.currentLang === 'ar' ? this.itemDetails.ItemsDetails[i].StockToNameAr : this.itemDetails.ItemsDetails[i].StockToNameEn
          }]],
          TransformQuantityBox: this.itemDetails.ItemsDetails[i].TransformQuantityBox,
          TransformQuantityNumber: this.itemDetails.ItemsDetails[i].TransformQuantityNumber,
        });
      }
      this.addItemForm.patchValue({
        transformPermissionName: this.itemDetails.TransformPermissionName,
        stockIdFrom: this.currentStoreFromObj,
        transformPermissionDate: new Date(this.itemDetails.TransformPermissionDate),
        itemsDetails: this.itemDetails.ItemsDetails
      });
      for (let i = 0; i < itemDetailsArr.length; i++) {
        this.transformationItems.push(this.fb.group(itemDetailsArr[i]));
      }
      this.addMoreItems();
      this.changeStockTo(this.addItemForm.get('stockIdFrom').value[0]);
    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });


  }
  loadMoreStockFrom(event: any) {
    if ((this.dataLengthFrom > 0 && !this.loadingFrom) && event.endIndex === this.allStoresFrom.m_Item1.length - 1) {
      this.loadingFrom = true;
      if (this.keywordFrom && this.keywordFrom.trim() !== '') {
        if (this.translate.currentLang === 'ar') {
          this.request.searchStocksFrom(++this.storeFromPageNum, this.keywordFrom).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        } else {
          this.request.searchStocksFromEn(++this.storeFromPageNum, this.keywordFrom).subscribe((allItems: any) => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        }
      } else {
        if (this.translate.currentLang === 'ar') {
          this.request.getTransformationFromStore(++this.storeFromPageNum).subscribe(allItems => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        } else {
          this.request.getTransformationFromStoreEn(++this.storeFromPageNum).subscribe(allItems => {
            this.dataLengthFrom -= allItems.m_Item1.length;
            this.allStoresFrom.m_Item1 = this.allStoresFrom.m_Item1.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
        }

      }


    }
  }
  onSearch(evt: any) {
    this.keywordFrom = evt.target.value;
    this.storeFromPageNum = 1;
    if (this.keywordFrom.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksFrom(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) =>{
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(0).css('height', '0');
          } else {
            $('.lazyContainer').eq(0).css('height', '300px');
          }
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksFromEn(this.storeFromPageNum, this.keywordFrom).subscribe((allStores: any) =>{
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(0).css('height', '0');
          } else {
            $('.lazyContainer').eq(0).css('height', '300px');
          }
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
        });
      }
    } else {
      if (this.translate.currentLang === 'en') {
        $('.lazyContainer').eq(0).css('height', '300px');
        this.request.getTransformationFromStoreEn(this.storeFromPageNum).subscribe(allStores => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
          $('.lazyContainer').eq(0).css('height', '300px');

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getTransformationFromStore(this.storeFromPageNum).subscribe(allStores => {
          this.allStoresFrom = allStores;
          this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
          $('.lazyContainer').eq(0).css('height', '300px');

        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }

  }
  onSearchTo(evt: any, index) {
    this.keywordTo = evt.target.value;
    this.storeToPageNum = 1;
    if (this.keywordTo.trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchStocksTo(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(index).css('height', '0');
          } else {
            $('.lazyContainer').eq(index).css('height', '300px');
          }
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchStocksToEn(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
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
        this.request.getTransformationToStoreEn(this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.getTransformationToStore(this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
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
      if(this.translate.currentLang === 'ar'){
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksTo(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, ++this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.getTransformationToStore(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, ++this.storeToPageNum).subscribe(allItems => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      } else {
        if (this.keywordTo && this.keywordTo.trim() !== '') {
          this.request.searchStocksToEn(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, ++this.storeToPageNum, this.keywordTo).subscribe((allStores: any) => {
            this.dataLengthTo -= allStores.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allStores.m_Item1);
            this.loadingTo = false;
          });
        } else {
          this.request.getTransformationToStoreEn(this.addItemForm.get('stockIdFrom').value ? this.addItemForm.get('stockIdFrom').value[0].value : this.currentStoreFrom, ++this.storeToPageNum).subscribe(allItems => {
            this.dataLengthTo -= allItems.m_Item1.length;
            this.allStoresTo.m_Item1 = this.allStoresTo.m_Item1.concat(allItems.m_Item1);
            this.loadingTo = false;
          });
        }
      }



    }
  }
  changeStockTo(id) {
    if (!this.prevStoreFrom || this.currentStoreFrom === id.value) {
      this.prevStoreFrom = id.value;
      this.prevStoreFromObj = id;
      this.currentStoreFrom = this.prevStoreFrom;
      if (this.translate.currentLang === 'en') {
        this.request.getTransformationToStoreEn(this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.getTransformationToStore(this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
          this.allStoresTo = allStores;
          this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    } else {
      if (this.transformationItems.length > 0 && this.allStoresTo) {
        $('#hint-store').modal('show');
      }
    }


  }
  get transformationItems() {
    return this.addItemForm.get('itemsDetails') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      TransformationPermissionId_Fk: this.fb.control(this.transformationOrderId),
      ItemsId_FK: this.fb.control(''),
      ItemsName: this.fb.control(''),
      ItemsCode: this.fb.control('', Validators.required),
      StockId_To_FK: this.fb.control([], Validators.required),
      TransformQuantityBox: this.fb.control('', Validators.compose([Validators.required, Validators.min(0)])),
      TransformQuantityNumber: this.fb.control('', Validators.compose([Validators.required, Validators.min(0)])),
    });
  }
  prevFromStockId() {
    this.prevStoreFrom = this.currentStoreFrom;
    this.addItemForm.patchValue({
      stockIdFrom: [this.prevStoreFromObj]
    });
  }
  resetForm() {
    this.allowScrollTo = true;
    this.currentStoreFrom = undefined;
    this.prevStoreFrom = undefined;
    this.duplicatedItem = -1;
    this.notFound = false;
    this.errorRow = -1;
    this.zerosRow = -1;
    this.errorRows = [];

    this.storeFromPageNum = 1;

    this.visitedFromStock = false;
    while (this.transformationItems.length > 0) {
      this.transformationItems.removeAt(0);
    }
    this.addItemForm.get('stockIdFrom').setValue([]);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
    this.allStoresTo = undefined;


  }
  resetTransformation() {
    this.allowScrollTo = true;
    this.currentStoreFrom = this.addItemForm.get('stockIdFrom').value[0].value;
    this.prevStoreFromObj = this.addItemForm.get('stockIdFrom').value[0];
    this.duplicatedItem = -1;
    this.notFound = false;
    this.errorRow = -1;
    this.zerosRow = -1;
    this.errorRows = [];

    while (this.transformationItems.length > 0) {
      this.transformationItems.removeAt(0);
    }
    this.addMoreItems();

    if (this.translate.currentLang === 'en') {
      this.request.getTransformationToStoreEn(+this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.getTransformationToStore(+this.currentStoreFrom, this.storeToPageNum = 1).subscribe(allStores => {
        this.allStoresTo = allStores;
        this.dataLengthTo = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
    $('#hint-store').modal('hide');

  }
  addItemSubmit() {
    if (!this.transformationItems.controls[this.transformationItems.controls.length - 1].get('ItemsId_FK').value && this.transformationItems.length > 1) {
      this.transformationItems.removeAt(this.transformationItems.length - 1 );
    }
    for (let i = 0; i < this.transformationItems.length; i++) {
      if (this.transformationItems.controls[i].get('TransformQuantityBox').value <= 0 && this.transformationItems.controls[i].get('TransformQuantityNumber').value <= 0) {
        this.errorRows.push(i);
        if (this.translate.currentLang === 'ar') {
          this.error('لابد ان تكون الكميه اكبر من صفر');
        } else {
          this.error('The quantity must be greater than zero');
        }
      }
    }
    if (!this.notFound && this.duplicatedItem === -1 && this.addItemForm.valid && this.errorRow === -1 && this.zerosRow === -1 && this.errorRows.length === 0) {
      const transformation = [];
      this.errorRows = [];
      for (let i = 0; i < this.addItemForm.get('itemsDetails').value.length; i++) {
        transformation.push({
          ItemsId_FK: this.addItemForm.get('itemsDetails').value[i].ItemsId_FK,
          StockId_To_FK: this.addItemForm.get('itemsDetails').value[i].StockId_To_FK[0].value,
          TransformQuantityBox: this.addItemForm.get('itemsDetails').value[i].TransformQuantityBox,
          TransformQuantityNumber: this.addItemForm.get('itemsDetails').value[i].TransformQuantityNumber
        });
      }
      const dateTime = new Date(this.addItemForm.get('transformPermissionDate').value);

      this.request.updateTransformation({
        TransformationOrderId: this.transformationOrderId,
        TransformPermissionName: this.itemDetails.TransformPermissionName,
        StockId_From_FK: this.addItemForm.get('stockIdFrom').value[0].value,
        TransformPermissionDate: dateTime.toDateString(),
        TransformationDataObj: transformation,
      }).subscribe((value: any) => {
          if (value.result !== true) {
            for (let i = 0; i < value.ErrorsId.length; i++) {
              const current = value.ErrorsId[i];
              for (let j = 0; j < transformation.length; j++) {
                if (current.m_Item1 === transformation[j].ItemsId_FK && current.m_Item2 === transformation[j].StockId_To_FK) {
                  this.errorRows.push(j);
                }
              }
            }
            if (this.errorRows.length > 0) {
              this.translate.currentLang === 'en' ? this.error('The required quantity does not exist') : this.error('الكميه المطلوبه غير موجوده');
            }
          } else {
            this.translate.currentLang === 'en' ? this.success('Transformation updated successfully') : this.success('تم تعديل التحويل بنجاح');
            this.resetForm();
            this.transformations.m_Item1[this.currentEditableRow] = value.TransmissionData[0];
            $('#edit-item').modal('hide');
          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }
  addMoreItems() {
    this.transformationItems.push(this.createItem());
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

    if (index === this.transformationItems.length - 1) {
      this.addMoreItems();
    }
    if(this.errorRows.includes(index)){
      this.errorRows = this.errorRows.filter(value => value !== index);
    }
    this.transformationItems.removeAt(index);
    if (this.transformationItems.length === 0) {
      this.notFound = false;
      this.duplicatedItem = -1;
      this.errorRow = -1;
      this.zerosRow = -1;
      this.errorRows = [];

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
  checkStoreFromValue(ele) {
    this.visitedFromStock = ele.length === 0;
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
  getItemName(itemCode: number | string, element, nextElement) {
    const stockId = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_To_FK'];
    const numberQuantity = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'];
    const box = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'];
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
          if (this.duplicatedItem === this.currentEditIndex) {
            this.duplicatedItem = -1;
          }
          if (this.zerosRow === this.currentEditIndex) {
            this.zerosRow = -1;
          }
          if (this.errorRow === this.currentEditIndex) {
            this.errorRow = -1;
          }
          if(this.errorRows.includes(this.currentEditIndex)){
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
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsName'].value = $event.ItemName;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsName'].setValue($event.ItemName);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode'].value = $event.ItemCode;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode'].setValue($event.ItemCode);
    const stockId = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_To_FK'];
    const numberQuantity = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'];
    const box = this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'];
    if (stockId.value.length !== 0 || numberQuantity.value !== 0 || box.value !== 0) {
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
      if(this.errorRows.includes(this.currentEditIndex)){
        this.errorRows = this.errorRows.filter(val => val !== this.currentEditIndex);
      }
    }
  }
  checkAvailabiltyQuantity(stockFromId: number, stockToId: number , boxNum: number, quantityNum: number, itemId: number, index: number) {
    this.zerosRow = (boxNum === 0 && quantityNum === 0) ? index : -1;
    if (this.duplicatedItem !== index && this.zerosRow === -1) {
      const boxTotal = this.mergeRows(itemId, stockToId, boxNum, quantityNum, index)[0];
      const quantityTotal = this.mergeRows(itemId, stockToId, boxNum, quantityNum, index)[1];
      this.request.checkAvailabiltyEdit(stockFromId, boxTotal, quantityTotal, itemId, this.transformationOrderId).subscribe((value: any) => {
        switch (value.result) {
          case null:
            this.errorRow = index;
            if (this.translate.currentLang === 'ar') {
              this.error('لا يحتوي المخزن علي هذا الصنف');
            } else {
              this.error('The store does not have this product');

            }
            break;
          case false:
            this.errorRow = index;
            if (this.translate.currentLang === 'ar') {
              this.error('المخزن لا يحتوي علي هذه الكميه');
            } else {
              this.error('The store does not have this quantity');
            }
            break;
          default:
            if (this.errorRow === index) {
              this.errorRow = -1;
            }
            if (this.errorRows.includes(index)) {
              this.errorRows = this.errorRows.filter(val => val !== index);
            }
            if (this.duplicatedItem === -1 &&  this.addItemForm.get('itemsDetails')['controls'][this.transformationItems.length - 1].controls['ItemsId_FK'].value && !this.notFound && this.errorRow === -1 && this.errorRows.length === 0) {
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
  checkDuplicated(stockTo: number, itemId: number, limit: number, stockFromId: number, boxNum: number, quantityNum: number) {
    this.duplicatedItem = -1;
    for (let i = 0; i < this.transformationItems.length; i++) {
      if (this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value.length !== 0) {
        if (limit !== i && itemId === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && stockTo === this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value[0].value) {
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
      this.checkAvailabiltyQuantity(stockFromId, stockTo, boxNum, quantityNum, itemId, limit);
    }
  }
  mergeRows(itemId: number, stockTo: string| number, boxNum: number, quantityNum: number, index: number) {
    let boxNumBefore = boxNum;
    let quantityNumBefore = quantityNum;
    for (let i = 0; i < this.transformationItems.length; i++) {
      if (this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value.length !== 0) {
        if (index !== i && itemId === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && stockTo !== this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value[0].value) {
          boxNumBefore += this.addItemForm.get('itemsDetails')['controls'][i].controls['TransformQuantityBox'].value;
          quantityNumBefore += this.addItemForm.get('itemsDetails')['controls'][i].controls['TransformQuantityNumber'].value;
        }
      }
    }
    return [boxNumBefore, quantityNumBefore];
  }
}
