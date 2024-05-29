import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { Validators } from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
declare var $: any ;
@Component({
  selector: 'app-add-transform',
  templateUrl: './add-transform.component.html',
  styleUrls: ['./add-transform.component.css']
})
export class AddTransformComponent implements OnInit {
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  storeFromPageNum = 1;
  storeToPageNum = 1;
  allStoresFrom;
  allStoresTo;
  dataLengthFrom: number;
  dataLengthTo: number;
  allowScrollTo = true;
  notFound = -1;
  today = new Date();
  currentStoreFrom: number | string;
  prevStoreFrom: number | string;
  prevStoreFromObj: any;
  transformName: any;
  loadingFrom = false;
  loadingTo = false;
  dropdownSettings = {};
  visitedFromStock = false;
  currentIndex: number;
  keywordFrom: string;
  keywordTo: string;
  currentEditIndex = 0;
  private disabledOption: {};
  constructor(public translate: TranslateService, private title: Title,
              private localeService: BsLocaleService, private fb: FormBuilder,
              private request: RequestsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.translate.get('header.links.transform.add').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getNextTransformationNumber().subscribe(value => this.transformName = value,
      error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));

    this.addItemForm = this.fb.group({
    transformPermissionName: [this.transformName],
    stockIdFrom: [[], Validators.required],
    transformPermissionDate: [this.today, Validators.required],
    itemsDetails: this.fb.array([this.createItem()])
  });
    if (this.translate.currentLang === 'en') {
      this.request.getTransformationFromStoreEn(this.storeFromPageNum).subscribe(allStores => {
        this.allStoresFrom = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.getTransformationFromStore(this.storeFromPageNum).subscribe(allStores => {
        this.allStoresFrom = allStores;
        this.dataLengthFrom = allStores.m_Item2 - allStores.m_Item1.length;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
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
  get transformationItems() {
    return this.addItemForm.get('itemsDetails') as FormArray;
  }
  createItem() {
    return this.fb.group( {
      ItemsId_FK: this.fb.control(''),
      ItemsCode_FK: this.fb.control('', Validators.required),
      StockId_To_FK: this.fb.control([], Validators.required),
      StockName_To_FK: this.fb.control(''),
      numberInbox: this.fb.control(''),
      totalNumber: this.fb.control(''),
      errorRow: this.fb.control(false),
      duplicatedRow: this.fb.control(false),
      zeroRow: this.fb.control(false),
      errorRows: this.fb.control(false),
      TransformQuantityBox: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
      TransformQuantityNumber: this.fb.control(0, Validators.compose([Validators.required, Validators.min(0)])),
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
  prevFromStockId() {
    this.prevStoreFrom = this.currentStoreFrom;
    this.addItemForm.patchValue({
      stockIdFrom: [this.prevStoreFromObj]
    });
  }
  resetTransformation() {
    this.allowScrollTo = true;
    this.currentStoreFrom = this.addItemForm.get('stockIdFrom').value[0].value;
    this.prevStoreFromObj = this.addItemForm.get('stockIdFrom').value[0];
    this.notFound = -1;
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
  resetForm() {
    this.allowScrollTo = true;
    this.currentStoreFrom = undefined;
    this.prevStoreFrom = undefined;
    this.notFound = -1;
    this.visitedFromStock = false;
    while (this.transformationItems.length > 0) {
      this.transformationItems.removeAt(0);
    }
    this.addItemForm.get('stockIdFrom').setValue([]);
    this.addItemForm.get('transformPermissionDate').setValue(this.today);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
    this.allStoresTo = undefined;
    this.addMoreItems();
  }
  addMoreItems() {

    this.transformationItems.push(this.createItem());
  }
  removeItem(index) {
    if (index === this.notFound) {
      this.notFound = -1;
    }

    if (index === this.transformationItems.length - 1) {
      this.addMoreItems();
    }
    this.transformationItems.removeAt(index);
    if (this.transformationItems.length === 0) {
      this.notFound = -1;
    }

  }

  addItemSubmit() {
    if (!this.transformationItems.controls[this.transformationItems.controls.length - 1].get('ItemsId_FK').value && this.transformationItems.length > 1) {
      this.transformationItems.removeAt(this.transformationItems.length - 1 );
    }
    let inValid = 0;
    if (this.notFound === -1 && this.addItemForm.valid) {
      const transformation = [];
      for (let i = 0; i < this.addItemForm.get('itemsDetails').value.length; i++) {
        transformation.push({
          ItemsId_FK: this.addItemForm.get('itemsDetails').value[i].ItemsId_FK,
          StockId_To_FK: this.addItemForm.get('itemsDetails').value[i].StockId_To_FK[0].StockId,
          TransformQuantityBox: this.addItemForm.get('itemsDetails').value[i].TransformQuantityBox,
          TransformQuantityNumber: this.addItemForm.get('itemsDetails').value[i].TransformQuantityNumber
        });
        if (this.addItemForm.get('itemsDetails')['controls'][i].controls['zeroRow'].value === true || this.addItemForm.get('itemsDetails')['controls'][i].controls['errorRow'].value === true || this.addItemForm.get('itemsDetails')['controls'][i].controls['duplicatedRow'].value === true){
          inValid++;
        }
      }
      const dateTime = new Date(this.addItemForm.get('transformPermissionDate').value);
      if (inValid === 0) {
        this.request.addTransformation({
          TransformPermissionName: this.transformName,
          StockId_From_FK: this.addItemForm.get('stockIdFrom').value[0].value,
          TransformPermissionDate: dateTime.toDateString(),
          TransformationDataObj: transformation,
        }).subscribe((value: any) => {
            if (value.m_Item1 !== true) {
              for (let i = 0; i < value.m_Item2.length; i++) {
                const current = value.m_Item2[i];
                for (let j = 0; j < transformation.length; j++) {
                  if (current.m_Item1 === transformation[j].ItemsId_FK && current.m_Item2 === transformation[j].StockId_To_FK) {
                    this.addItemForm.get('itemsDetails')['controls'][j].controls['errorRows'].setValue(true);
                  }
                }
              }
              if ( value.m_Item2.length.length > 0) {
                this.translate.currentLang === 'en' ? this.error('The required quantity does not exist') : this.error('الكميه المطلوبه غير موجوده');
              }
            } else {
              this.translate.currentLang === 'en' ? this.success('Transformation added successfully') : this.success('تم اضافه التحويل بنجاح');
              this.resetForm();
              this.request.getNextTransformationNumber().subscribe(val => this.transformName = val,
                error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
            }
          }, error => {
            this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
          }
        );
      } else {
        if (this.translate.currentLang === 'ar') {
          this.error('بعض البيانات المدخله غير صحيحه او غير مكتمله');
        } else {
          this.error('some information are not correct');
        }
      }

    }
    else {
      if (this.translate.currentLang === 'ar') {
        this.error('بعض البيانات المدخله غير صحيحه او غير مكتمله');
      } else {
        this.error('some information are not correct');
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
  checkStoreFromValue(ele) {
    this.visitedFromStock = ele.length === 0;
  }
  getItemName(itemCode: number | string, element, nextElement) {
    this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['StockId_To_FK'].setValue([]);
    this.request.getItemBoxQuantity(itemCode, this.addItemForm.get('stockIdFrom').value[0].value).subscribe((value: any) => {
      if (value.result) {
        element.value = value.ItemId;
        element.setValue(value.ItemId);
        nextElement.value = value.ItemName;
        this.notFound = -1;
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['numberInbox'].setValue(value.NumberInBox);
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['numberInbox'].value = value.NumberInBox;
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['totalNumber'].setValue(value.TotalNum);
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['totalNumber'].value = value.TotalNum;
        if (value.QuantityBox === 0 && value.NumberItem === 0) {
          this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['zeroRow'].setValue(true);

          if (this.translate.currentLang === 'en') {
            this.error('The store does not have this product');
          } else {
            this.error('الكميه نفذت ولم تعد متوفره');
          }
        } else {
          const preExist = this.checkPreExistItems(this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['ItemsId_FK'].value, this.currentEditIndex);
          if (!preExist.isExist) {
            this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].setValue(value.QuantityBox);
            this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].value = value.QuantityBox;
            this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].setValue(value.NumberItem);
            this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].value = value.NumberItem;
            this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['zeroRow'].setValue(false);

          } else {
            const prevQuantites = this.sumQuantity(preExist.quantites);
            const prevTotal = this.getItemQuantity(prevQuantites.box, prevQuantites.quantity, this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['numberInbox'].value);
            const available = this.checkAvailableQuantity(this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['totalNumber'].value, prevTotal);
            if (available > 0) {
              const quantites = this.getBoxQuantity(available, this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['numberInbox'].value);
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].setValue(quantites[1]);
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].value = quantites[1];
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].setValue(quantites[0]);
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].value = quantites[0];
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['zeroRow'].setValue(false);

            } else {
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['zeroRow'].setValue(true);

              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].setValue(0);
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityBox'].value = 0;
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].setValue(0);
              this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['TransformQuantityNumber'].value = 0;
              if (this.translate.currentLang === 'en') {
                this.error('The store does not have this quantity');
              } else {
                this.error('الكميه المطلوبه لم تعد متوفره');

              }

            }

          }
        }
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['duplicatedRow'].setValue(false);
        this.addItemForm.get('itemsDetails')['controls'][this.currentEditIndex].controls['errorRows'].setValue(false);

        if (this.addItemForm.get('itemsDetails')['controls'][this.transformationItems.length - 1].controls['ItemsId_FK'].value && this.notFound === -1) {
          this.addMoreItems();
        }
      } else if (value.m_Item6 === false) {
        this.notFound = this.currentEditIndex;
        element.value = '';
        element.setValue('');
        if (this.translate.currentLang === 'ar') {
          nextElement.value = 'لا يوجد';
        } else {
          nextElement.value = 'not found';
        }
      } else {
        this.notFound = this.currentEditIndex;
        element.value = '';
        element.setValue('');
        if (this.translate.currentLang === 'ar') {
          nextElement.value = 'الكود غير صحيح';
        } else {
          nextElement.value = 'Incorrect Code';
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
    this.notFound = -1;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['StockId_To_FK'].setValue([]);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsId_FK'].value = $event.ItemId;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode_FK'].value = $event.ItemCode;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsCode_FK'].setValue($event.ItemCode);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['StockName_To_FK'].value = $event.ItemName;

    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['numberInbox'].setValue($event.NumberInBox);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['numberInbox'].value = $event.NumberInBox;
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['totalNumber'].setValue($event.TotalNum);
    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['totalNumber'].value = $event.TotalNum;
    if ($event.QuantityBox === 0 && $event.NumberItem === 0) {
      this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['zeroRow'].setValue(true);
      if (this.translate.currentLang === 'en') {
        this.error('The store does not have this product');
      } else {
        this.error('الكميه نفذت ولم تعد متوفره');
      }
    } else {
      const preExist = this.checkPreExistItems(this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['ItemsId_FK'].value, this.currentIndex);
      if (!preExist.isExist) {
        this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].setValue($event.QuantityBox);
        this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].value = $event.QuantityBox;
        this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].setValue($event.NumberItem);
        this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].value = $event.NumberItem;
        this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['zeroRow'].setValue(false);

      } else {
        const prevQuantites = this.sumQuantity(preExist.quantites);
        const prevTotal = this.getItemQuantity(prevQuantites.box, prevQuantites.quantity, this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['numberInbox'].value);
        const available = this.checkAvailableQuantity(this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['totalNumber'].value, prevTotal);
        if (available > 0) {
          const quantites = this.getBoxQuantity(available, this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['numberInbox'].value);
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].setValue(quantites[1]);
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].value = quantites[1];
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].setValue(quantites[0]);
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].value = quantites[0];
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['zeroRow'].setValue(false);

        } else {
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['zeroRow'].setValue(true);

          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].setValue(0);
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityBox'].value = 0;
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].setValue(0);
          this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['TransformQuantityNumber'].value = 0;
          if (this.translate.currentLang === 'en') {
            this.error('The store does not have this quantity');
          } else {
            this.error('الكميه المطلوبه لم تعد متوفره');

          }

        }
    }

    }

    this.addItemForm.get('itemsDetails')['controls'][this.currentIndex].controls['duplicatedRow'].setValue(false);

    if (this.addItemForm.get('itemsDetails')['controls'][this.transformationItems.length - 1].controls['ItemsId_FK'].value && this.notFound === -1) {
      this.addMoreItems();
    }

  }
  checkAvailabiltyQuantity(boxNum: number, quantityNum: number, itemId: number, index: number) {
    if (this.addItemForm.get('itemsDetails')['controls'][this.transformationItems.length - 1].controls['ItemsId_FK'].value !== '') {
      this.addMoreItems();
    }
    if (boxNum === 0 && quantityNum === 0) {
      this.addItemForm.get('itemsDetails')['controls'][index].controls['zeroRow'].setValue(true);

          if (this.translate.currentLang === 'ar') {
            this.error('لابد ان تكون الكميه اكبر من صفر');
          } else {
            this.error('The quantity must be greater than zero');
          }
    } else {
      this.addItemForm.get('itemsDetails')['controls'][index].controls['zeroRow'].setValue(false);
    }
    const preExist = this.checkPreExistItems(itemId, index);
    if (!preExist.isExist) {
      const prevTotal = this.getItemQuantity(boxNum, quantityNum, this.addItemForm.get('itemsDetails')['controls'][index].controls['numberInbox'].value);
      const available = this.checkAvailableQuantity(this.addItemForm.get('itemsDetails')['controls'][index].controls['totalNumber'].value, prevTotal);
      if (available < 0) {
        this.addItemForm.get('itemsDetails')['controls'][index].controls['errorRow'].setValue(true);

        if (this.translate.currentLang === 'en') {
          this.error('The store does not have this quantity');
        } else {
          this.error('الكميه المطلوبه لم تعد متوفره');
        }
      } else {
        this.addItemForm.get('itemsDetails')['controls'][index].controls['errorRow'].setValue(false);

      }
    } else {
      const prevQuantites = this.sumQuantityWithCurrent(preExist.quantites, boxNum, quantityNum);
      const prevTotal = this.getItemQuantity(prevQuantites.box, prevQuantites.quantity, this.addItemForm.get('itemsDetails')['controls'][index].controls['numberInbox'].value);
      const available = this.checkAvailableQuantity(this.addItemForm.get('itemsDetails')['controls'][index].controls['totalNumber'].value, prevTotal);
      if (available < 0) {
        this.addItemForm.get('itemsDetails')['controls'][index].controls['errorRow'].setValue(true);

        if (this.translate.currentLang === 'en') {
          this.error('The store does not have this quantity');
        } else {
          this.error('الكميه المطلوبه لم تعد متوفره');
        }
      } else {
        this.addItemForm.get('itemsDetails')['controls'][index].controls['errorRow'].setValue(false);

      }
    }

  }
  checkDuplicated(stockTo: number, itemId: number, limit: number) {
    if (this.addItemForm.get('itemsDetails')['controls'][this.transformationItems.length - 1].controls['ItemsId_FK'].value !== '') {
      this.addMoreItems();
    }
    this.addItemForm.get('itemsDetails')['controls'][limit].controls['duplicatedRow'].setValue(false);

    for (let i = 0; i < this.transformationItems.length; i++) {
      if (this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value.length !== 0) {
        if (limit !== i && itemId === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && stockTo === this.addItemForm.get('itemsDetails')['controls'][i].controls['StockId_To_FK'].value[0].value) {
          this.addItemForm.get('itemsDetails')['controls'][limit].controls['duplicatedRow'].setValue(true);

          if (this.translate.currentLang === 'ar') {
            this.error('هذا الصنف لا يمكن ان يحول لنفس المخزن اكثر من مره');
          } else {
            this.error('This item can not be transformed to the same stock');
          }
        }
      }
      }
    }
  checkPreExistItems(current: number, index) {
    const exist = {
      isExist : false,
      quantites: []
    };
    if (this.transformationItems.length > 1) {
      for (let i = 0; i < this.transformationItems.length; i++) {
      if (current === this.addItemForm.get('itemsDetails')['controls'][i].controls['ItemsId_FK'].value && index !== i) {
        exist.isExist = true;
        exist.quantites.push({box: this.addItemForm.get('itemsDetails')['controls'][i].controls['TransformQuantityBox'].value, quantity:  this.addItemForm.get('itemsDetails')['controls'][i].controls['TransformQuantityNumber'].value});
      }
      }
    }
    return exist;
  }
  sumQuantity(quantity: any) {
    let boxes = 0;
    let quantites = 0;
    for (let i = 0; i < quantity.length; i++) {
      boxes += quantity[i].box;
      quantites += quantity[i].quantity;
    }
    return {box: boxes, quantity: quantites};
  }
  sumQuantityWithCurrent(quantity: any, box: number, currentQuantity: number) {
    let boxes = 0;
    let quantites = 0;
    for (let i = 0; i < quantity.length; i++) {
      boxes += quantity[i].box;
      quantites += quantity[i].quantity;
    }
    return {box: boxes + box, quantity: quantites + currentQuantity};
  }
  getItemQuantity(box, quantity, numberInbox) {
    let allQuantity = 0;
    if (box === 0) {
      allQuantity = quantity;
    } else {
      if (quantity !== 0) {
        const quantityBox = numberInbox * (box);
        allQuantity = Math.floor(quantityBox + quantity);
      } else {
        allQuantity = Math.floor(numberInbox * box);
      }
    }
    return allQuantity;
  }
  checkAvailableQuantity(total, existedQuantity) {
    return total - existedQuantity;
  }
  getBoxQuantity(existedQuantity, numberInbox) {
    const quantity = Math.floor(existedQuantity % numberInbox);
    const box = Math.floor(existedQuantity / numberInbox);
    return [quantity, box];
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  focusStockFrom() {
    $('.c-btn').click();
  }
  focusStockTo() {
    $('.c-btn').click();

  }
}
