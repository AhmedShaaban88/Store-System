import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { Validators } from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
declare var $: any 
@Component({
  selector: 'app-add-returns',
  templateUrl: './add-returns.component.html',
  styleUrls: ['./add-returns.component.css']
})
export class AddReturnsComponent implements OnInit {
  addItemForm: FormGroup;
  itemsDetails: FormArray;
  maintainacePageNum = 1;
  allMaintainaces;
  dataLengthFrom: number;
  itemsPageNum = 1;
  allItems;
  dataLength: number;
  today = new Date();
  returnName: any;
  loadingFrom = false;
  dropdownSettings = {};
  keywordFrom: string;
  zeroRow = -1;
  errorRows = [];
  spinnerMoreData: boolean;
  allowScroll: boolean;
  visitedMaintainace = false;
  itemDetailsArr = [];
  constructor(public translate: TranslateService, private title: Title,
              private localeService: BsLocaleService, private fb: FormBuilder,
              private request: RequestsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.translate.get('header.links.returns.add').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);
    this.request.getNextReturnNumber().subscribe(value => this.returnName = value,
      error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));

    this.addItemForm = this.fb.group({
      RecievedFromMaintanceName: [this.returnName],
      MaintenanceOrderId_FK: [[], Validators.required],
      RecievedFromMaintanceDate: [this.today, Validators.required],
      RecievedDatalist: this.fb.array([])
  });
      this.request.getMaintainaceDropDown(this.maintainacePageNum).subscribe(allItems => {
        this.allMaintainaces = allItems;
        this.dataLengthFrom = allItems.m_Item2 - allItems.m_Item1.length;
      }, error => {
        this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error);
      });

    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر المحضر' : 'Choose',
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
  }
  @HostListener('window:scroll', [])
  onScroll(): void {

    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      this.request.getReturnItems(++this.itemsPageNum, this.addItemForm.get('MaintenanceOrderId_FK').value[0].value).subscribe(allItems => {
          this.dataLength -= (allItems as any).m_Item1.length;
          this.allowScroll = this.dataLength > 0;
          this.allItems = (
            {
              m_Item1: this.allItems.m_Item1.concat((allItems as any).m_Item1),
              m_Item2: (allItems as any).m_Item2
            }
          );
        for (let i = this.returnsItems.length; i < this.allItems.m_Item1.length; i++) {
          this.itemDetailsArr.push({
            ItemsCode: this.allItems.m_Item1[i].ItemsCode,
            ItemsId_FK: this.allItems.m_Item1[i].ItemsId_FK,
            ItemsName: this.allItems.m_Item1[i].ItemsName,
            RecievedMaintanceStockId_To_FK: this.allItems.m_Item1[i].StockId_To,
            StockToName: this.allItems.m_Item1[i].StockToName,
            RecievedMaintanceStockId_From_FK: this.allItems.m_Item1[i].StockId_From,
            StockFromName: this.allItems.m_Item1[i].StockFromName,
            RecievedFromMaintanceItemsQuantityBox: this.allItems.m_Item1[i].MaintenanceOrderBox,
            originalBoxCount: this.allItems.m_Item1[i].MaintenanceOrderBox,
            RecievedFromMaintanceItemsQuantityNumber: this.allItems.m_Item1[i].MaintenanceOrderQuantity,
            originalQuantityCount: this.allItems.m_Item1[i].MaintenanceOrderQuantity,

          });
        }

        for(let i = this.returnsItems.length; i < this.allItems.m_Item1.length; i++) {
          this.returnsItems.push(this.fb.group(this.itemDetailsArr[i]));
        }
        if ($('#checkAll').prop('checked')) {
          $('#checkAll').prop('indeterminate', true);
        }

        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }, () => this.spinnerMoreData = false
      );
    }
  }
  checkAllBoxes() {
    const status = $('#checkAll').prop('checked');
    for (let i = 0; i < this.returnsItems.length; i++) {
      $(`#${i}`).prop('checked', status);
    }
  }
  checkOneBox(currentIndex: number) {
    const boxesLength = this.returnsItems.length;
    let boxCheckedLenght = 0;
    for (let i = 0; i < boxesLength; i++) {
     const boxNum = this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedFromMaintanceItemsQuantityBox'].value;
     const quantityNum = this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedFromMaintanceItemsQuantityNumber'].value;
     const itemId = this.addItemForm.get('RecievedDatalist')['controls'][i].controls['ItemsId_FK'].value;
     const maintainaceId = this.addItemForm.get('MaintenanceOrderId_FK').value;
     const stockFrom = this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedMaintanceStockId_From_FK'].value;
     const stockTo = this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedMaintanceStockId_To_FK'].value;
      if (($(`#${i}`).prop('checked'))) {
        boxCheckedLenght++;
      }
      if (($(`#${i}`).prop('checked')) === false && this.errorRows.indexOf(i) > -1) {
        this.errorRows = this.errorRows.filter(value => value !== i);
      }
      if (($(`#${i}`).prop('checked')) === false && this.zeroRow === i) {
        this.zeroRow = -1;
      }
      if (($(`#${i}`).prop('checked')) === true && (this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedFromMaintanceItemsQuantityBox'].value === 0 && this.addItemForm.get('RecievedDatalist')['controls'][i].controls['RecievedFromMaintanceItemsQuantityNumber'].value === 0)) {
        this.zeroRow = i;
        if (this.translate.currentLang === 'ar') {
          this.error('لا يمكن ان تكون القيمه تساوي صفر');
        } else {
          this.error('Value cannot be zero');
        }
      }
      if(($(`#${i}`).prop('checked')) && currentIndex === i && (boxNum > 0 || quantityNum > 0)) {
        this.checkAvailabiltyQuantity(stockFrom, stockTo, boxNum, quantityNum, i, maintainaceId, itemId);
      }

    }
    if (boxCheckedLenght === boxesLength) {
      $('#checkAll').prop('indeterminate', false);
      $('#checkAll').prop('checked', true);
    } else if (boxCheckedLenght > 0 && (boxCheckedLenght < boxesLength)) {
      $('#checkAll').prop('indeterminate', true);
    } else {
     $('#checkAll').prop('indeterminate', false);
     $('#checkAll').prop('checked', false);
    }
  }
  get returnsItems() {
    return this.addItemForm.get('RecievedDatalist') as FormArray;
  }
  loadMoreMaintainace(event: any) {

    if ((this.dataLengthFrom > 0 && !this.loadingFrom) && event.endIndex === this.allMaintainaces.m_Item1.length - 1) {
      this.loadingFrom = true;
      if (this.keywordFrom && this.keywordFrom.trim() !== '') {
        this.request.searchMaintainaceDropDown(++this.maintainacePageNum, this.keywordFrom).subscribe((allItems: any) => {
          this.dataLengthFrom -= allItems.m_Item1.length;
          this.allMaintainaces.m_Item1 = this.allMaintainaces.m_Item1.concat(allItems.m_Item1);
          this.loadingFrom = false;
        });
      } else {
        this.request.getMaintainaceDropDown(++this.maintainacePageNum).subscribe(allItems => {
          this.dataLengthFrom -= allItems.m_Item1.length;
          this.allMaintainaces.m_Item1 = this.allMaintainaces.m_Item1.concat(allItems.m_Item1);
          this.loadingFrom = false;
        });
      }
    }
      }
  onSearch(evt: any) {
    this.keywordFrom = evt.target.value;
    this.maintainacePageNum = 1;
    if (this.keywordFrom.trim() !== '') {
        this.request.searchMaintainaceDropDown(this.maintainacePageNum, this.keywordFrom).subscribe((allItems: any) => {
          if (allItems.m_Item2 === 0) {
            $('.lazyContainer').eq(0).css('height', '0');
          } else {
            $('.lazyContainer').eq(0).css('height', '300px');
          }
          this.allMaintainaces = allItems;
          this.dataLengthFrom = allItems.m_Item2 - allItems.m_Item1.length;
        });

    } else {
        this.request.getMaintainaceDropDown(this.maintainacePageNum).subscribe(allItems => {
          this.allMaintainaces = allItems;
          this.dataLengthFrom = allItems.m_Item2 - allItems.m_Item1.length;
        }, error => {
          this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error);
        });
      }

  }
  changeMaintainace(id) {
    this.spinnerMoreData = true;
          this.itemDetailsArr = [];
            this.zeroRow = -1;
            this.itemsPageNum = 1;
            this.allowScroll = true;
        while(this.returnsItems.length > 0) {
              this.returnsItems.removeAt(0);
            }
    $('#checkAll').prop('indeterminate', false);
    $('#checkAll').prop('checked', false);
          this.request.getReturnItems(+this.itemsPageNum, id.value).subscribe(allItems => {
            this.allItems = allItems;
            this.dataLength = allItems.m_Item2 - allItems.m_Item1.length;
            for (let i = 0; i < allItems.m_Item1.length; i++) {
              this.itemDetailsArr.push({
                ItemsCode: this.allItems.m_Item1[i].ItemsCode,
                ItemsId_FK: this.allItems.m_Item1[i].ItemsId_FK,
                ItemsName: this.allItems.m_Item1[i].ItemsName,
                RecievedMaintanceStockId_To_FK: this.allItems.m_Item1[i].StockId_To,
                StockToName: this.allItems.m_Item1[i].StockToName,
                RecievedMaintanceStockId_From_FK: this.allItems.m_Item1[i].StockId_From,
                StockFromName: this.allItems.m_Item1[i].StockFromName,
                RecievedFromMaintanceItemsQuantityBox: this.allItems.m_Item1[i].MaintenanceOrderBox,
                originalBoxCount: this.allItems.m_Item1[i].MaintenanceOrderBox,
                RecievedFromMaintanceItemsQuantityNumber: this.allItems.m_Item1[i].MaintenanceOrderQuantity,
                originalQuantityCount: this.allItems.m_Item1[i].MaintenanceOrderQuantity,
              });
            }
            this.addItemForm.patchValue({
              RecievedDatalist: this.allItems.m_Item1
            });

            for(let i = 0; i < this.itemDetailsArr.length; i++) {
              this.returnsItems.push(this.fb.group(this.itemDetailsArr[i]));
            }
          }, error => {
            this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error);
          }, () => this.spinnerMoreData = false);
  }
  resetForm() {
    this.itemsPageNum = 1;
    this.zeroRow = -1;
    this.errorRows = [];
    this.visitedMaintainace = false;
    while (this.returnsItems.length > 0) {
      this.returnsItems.removeAt(0);
    }
    this.addItemForm.get('MaintenanceOrderId_FK').setValue([]);
    this.addItemForm.get('RecievedFromMaintanceDate').setValue(this.today);
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
    this.allItems = undefined;
  }
  addItemSubmit() {
    if (!$('#checkAll').prop('indeterminate') && !$('#checkAll').prop('checked')) {
       this.translate.currentLang === 'en' ? this.error('Select items first') : this.error('قم بتحديد العناصر اولا');
       return;
    }
    if (this.addItemForm.valid && this.zeroRow === -1) {
      const returns = [];
      this.errorRows = [];

      for (let i = 0; i < this.returnsItems.length; i++) {
        if (($(`#${i}`).prop('checked'))) {
          returns.push({
            ItemsId_FK: this.returnsItems.controls[i].get('ItemsId_FK').value,
            RecievedMaintanceStockId_From_FK:  this.returnsItems.controls[i].get('RecievedMaintanceStockId_From_FK').value,
            RecievedMaintanceStockId_To_FK: this.returnsItems.controls[i].get('RecievedMaintanceStockId_To_FK').value,
            RecievedFromMaintanceItemsQuantityBox: this.returnsItems.controls[i].get('RecievedFromMaintanceItemsQuantityBox').value,
            RecievedFromMaintanceItemsQuantityNumber: this.returnsItems.controls[i].get('RecievedFromMaintanceItemsQuantityNumber').value,
            originalIndex: i
          });
        }

      }
      const dateTime = new Date(this.addItemForm.get('RecievedFromMaintanceDate').value);

      this.request.addRetrun({
        RecievedFromMaintanceName: this.returnName,
        MaintenanceOrderId_FK: this.addItemForm.get('MaintenanceOrderId_FK').value[0].value,
        RecievedFromMaintanceDate: dateTime.toDateString(),
        RecievedDatalist: returns,
      }).subscribe((value: any) => {
          if (value.m_Item1 !== true) {
            for (let i = 0; i < value.m_Item2.length; i++) {
              const current = value.m_Item2[i];
            for (let j = 0; j < returns.length; j++) {
              if (current.m_Item1 === returns[j].ItemsId_FK && current.m_Item2 === returns[j].RecievedMaintanceStockId_From_FK && current.m_Item3 === returns[j].RecievedMaintanceStockId_To_FK) {
                this.errorRows.push(returns[j].originalIndex);
            }
            }
            }
            this.translate.currentLang === 'en' ? this.error('The store does not contain the required value') : this.error('المخزن لا يحتوي علي العدد المطلوب');
          } else {
            this.translate.currentLang === 'en' ? this.success('The returns record was successfully added') : this.success('تم اضافه محضر المرتجع بنجاح');
            this.request.getNextReturnNumber().subscribe(val => this.returnName = val,
              error => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error));
            this.resetForm();

          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  checkAvailabiltyQuantity(stockFrom: number, stockTo: number, boxNum: number, quantityNum: number, index, maintainanceId: number, itemId: number) {
    if ($(`#${index}`).prop('checked')) {
      if (boxNum > 0 || quantityNum > 0) {
        this.request.availableQuantityReturn(stockFrom, stockTo, quantityNum, boxNum, itemId, maintainanceId[0].value).subscribe(value => {
          if (!value.m_Item1) {
            this.zeroRow = index;
            if (this.translate.currentLang === 'ar') {
              this.error('المخزن لا يحتوي علي هذه الكميه ' + value.m_Item4 + ' عنصر');
            } else {
              this.error('The store does not have this quantity the available is' + value.m_Item4 + ' item');
            }
          }
        }, error1 => {
          if (this.translate.currentLang === 'ar') {
            this.error('حدث خطأ غير متوقع');
          } else {
            this.error(error1);
          }
        });
      } else if (boxNum === 0 && quantityNum === 0) {
        this.zeroRow = index;
        if (this.translate.currentLang === 'ar') {
          this.error('لا يمكن ان تكون القيمه تساوي صفر');
        } else {
          this.error('Value cannot be zero');
        }
      } else {
        if (index === this.zeroRow) {
          this.zeroRow = -1;
        }
      }
    }
  }
  checkMaintainaceValue(ele) {
    this.visitedMaintainace = ele.length === 0;
  }
  focusMaintaince() {
    $('.c-btn').click();
  }
}
