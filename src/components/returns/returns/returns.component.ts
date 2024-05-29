import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BsLocaleService} from 'ngx-bootstrap';
import {IReturn} from '../../../interfaces/Returns';
declare var $: any 
@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.css']
})
export class ReturnsComponent implements OnInit {
  filter = false;
  search = false;
  allReturns;
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  selectedItem: IReturn;
  dropdownSettings = {};
  maintainacePageNum = 1;
  allMaintainaces;
  dataLengthFrom: number;
  loadingFrom = false;
  keywordFrom: string;
  currentEditableRow = 0;
  errorRows = [];
  zeroRow = -1;
  addItemForm: FormGroup;
  visitedMaintainace = false;
  itemDetailsArr = [];
  maintainanceName;
  maintainanceDate;
  maintainanceOrderId;
  allItems: any;
  recieveId: number;
  checkDate: Array<any>;
  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder,  private localeService: BsLocaleService  ) { }

  ngOnInit() {
    this.translate.get('header.links.returns.title').subscribe(value =>  this.title.setTitle(value));
    this.localeService.use(this.translate.currentLang);

    this.request.getAllReturns(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.allReturns = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
    this.addItemForm = this.fb.group({
      RecievedFromMaintanceName: [''],
      MaintenanceOrderId_FK: [[], Validators.required],
      RecievedFromMaintanceDate: ['', Validators.required],
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
  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
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
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      this.request.getAllTransformations(++this.pageNum, this.deleteNo).subscribe(allItems => {
          this.dataLength -= (allItems as any).m_Item1.length;
          this.allowScroll = this.dataLength > 0;
          this.allReturns = (
            {
              m_Item1: this.allReturns.m_Item1.concat((allItems as any).m_Item1),
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
      this.request.deleteReturn(this.selectedItem.RecievedFromMaintanceId).subscribe(value => {
          this.allReturns.m_Item1 = this.allReturns.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.allReturns.m_Item2 = this.allReturns.m_Item2 - 1;
          this.deleteNo++;
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }
  checkAllBoxes() {
    const status = $('#checkAll').prop('checked');
    for (let i = 0; i < this.returnsItems.length; i++) {
      $(`#${i}`).prop('checked', status);
    }
  }
  checkOneBox(currentIndex: number, itemId: number, stockFrom: number, stockTo: number) {
    const boxesLength = this.returnsItems.length;
    let boxCheckedLenght = 0;
    for (let i = 0; i < boxesLength; i++) {
      if (($(`#${i}`).prop('checked'))) {
        boxCheckedLenght++;
      }
      if (($(`#${i}`).prop('checked')) === false && this.errorRows.indexOf(i) > -1) {
        this.errorRows = this.errorRows.filter(value => value !== i);
      }
      if (($(`#${i}`).prop('checked')) === false && this.zeroRow === i) {
        this.zeroRow = -1;
      }
    }
    if (!($(`#${currentIndex}`).prop('checked'))) {
      this.returnsItems.at(currentIndex).get('RecievedFromMaintanceItemsQuantityBox').setValue(this.returnsItems.at(currentIndex).get('originalBoxCount').value);
      this.returnsItems.at(currentIndex).get('RecievedFromMaintanceItemsQuantityNumber').setValue(this.returnsItems.at(currentIndex).get('originalQuantityCount').value);
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
  checkMaintainaceValue(ele) {
    this.visitedMaintainace = ele.length === 0;
  }
  focusMaintaince() {
    $('.c-btn').click();
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
    this.resetForm();
    $('#checkAll').prop('indeterminate', false);
    $('#checkAll').prop('checked', false);
    this.request.getReturnItemsEditMode(id.MaintenanceOrderId, this.recieveId).subscribe(item => {
      this.itemDetailsArr = [];
      this.allItems = item;
      for (let i = 0; i < this.allItems.m_Item1.length; i++) {
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
          status: this.allItems.m_Item1[i].statusCheck,
        });

      }
      this.maintainanceName = this.allItems.m_Item1[0].RecieveName;
      this.maintainanceDate = this.allItems.m_Item1[0].RecieveDate;
      this.maintainanceOrderId = [[{
        value: this.allItems.m_Item1[0].MaintanceDropDownId,
        label:  this.allItems.m_Item1[0].MaintanceDropDownName
      }]];
      this.addItemForm.patchValue({
        RecievedFromMaintanceName: this.maintainanceName,
        RecievedFromMaintanceDate: new Date(this.maintainanceDate),
        MaintenanceOrderId_FK: this.maintainanceOrderId[0],
        RecievedDatalist: this.itemDetailsArr
      });
      for(let i = 0; i < this.itemDetailsArr.length; i++) {
        this.returnsItems.push(this.fb.group(this.itemDetailsArr[i]));
      }

    }, error => {
      this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error);
    });
  }
  resetForm() {
    this.zeroRow = -1;
    this.errorRows = [];
    this.visitedMaintainace = false;
    while (this.returnsItems.length > 0) {
      this.returnsItems.removeAt(0);
    }
    this.addItemForm.markAsUntouched();
    this.addItemForm.markAsPristine();
    this.allItems = undefined;
    this.checkDate = [];
  }
  editItem(id: any) {
   this.resetForm();
   this.recieveId = id.RecievedFromMaintanceId;
    this.request.getReturn(id.RecievedFromMaintanceId).subscribe(item => {
      this.itemDetailsArr = [];
      this.allItems = item;
          for (let i = 0; i < this.allItems.m_Item1.length; i++) {
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
              status: this.allItems.m_Item1[i].statusCheck,
            });
            if (this.itemDetailsArr[i].status) {
              this.checkDate.push({
                RecievedFromMaintanceId_FK: this.recieveId,
                ItemsId_FK: this.itemDetailsArr[i].ItemsId_FK,
                MaintenanceOrderBox: this.itemDetailsArr[i].originalBoxCount,
                MaintenanceOrderQuantity: this.itemDetailsArr[i].originalQuantityCount,
                StockId_To: this.itemDetailsArr[i].RecievedMaintanceStockId_To_FK,
                StockId_From: this.itemDetailsArr[i].RecievedMaintanceStockId_From_FK,
              });
            }

          }
      this.maintainanceName = this.allItems.m_Item1[0].RecieveName;
      this.maintainanceDate = this.allItems.m_Item1[0].RecieveDate;
      this.maintainanceOrderId = [[{
        value: this.allItems.m_Item1[0].MaintanceDropDownId,
        label:  this.allItems.m_Item1[0].MaintanceDropDownName
      }]];
          this.addItemForm.patchValue({
            RecievedFromMaintanceName: this.maintainanceName,
            RecievedFromMaintanceDate: new Date(this.maintainanceDate),
            MaintenanceOrderId_FK: this.maintainanceOrderId[0],
            RecievedDatalist: this.itemDetailsArr
          });
          for(let i = 0; i < this.itemDetailsArr.length; i++) {
            this.returnsItems.push(this.fb.group(this.itemDetailsArr[i]));
          }
      const boxesLength = this.itemDetailsArr.length;
      let boxCheckedLenght = 0;
      for (let i = 0; i < boxesLength; i++) {
        if (this.itemDetailsArr[i].status) {
          boxCheckedLenght++;
        }
      }
      $( () =>  {
        if (boxCheckedLenght === boxesLength) {
          $('#checkAll').prop('indeterminate', false);
          $('#checkAll').prop('checked', true);
        } else if (boxCheckedLenght > 0 && (boxCheckedLenght < boxesLength)) {
          $('#checkAll').prop('indeterminate', true);
        } else {
          $('#checkAll').prop('indeterminate', false);
          $('#checkAll').prop('checked', false);
        }
      });

        }, error => {
          this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error);
        });

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

      this.request.updateReturn({
        RecievedFromMaintanceName: this.maintainanceName,
        MaintenanceOrderId_FK: this.addItemForm.get('MaintenanceOrderId_FK').value[0].value,
        RecievedFromMaintanceDate: dateTime.toDateString(),
        RecievedFromMaintanceId: this.recieveId,
        RecievedDatalist: returns,
      }).subscribe((value: any) => {
          if (value.Status !== true) {
            for (let i = 0; i < value.ErrorList.length; i++) {
              const current = value.ErrorList[i];
              for (let j = 0; j < returns.length; j++) {
                if (current.m_Item1 === returns[j].ItemsId_FK && current.m_Item2 === returns[j].RecievedMaintanceStockId_From_FK && current.m_Item3 === returns[j].RecievedMaintanceStockId_To_FK) {
                  this.errorRows.push(returns[j].originalIndex);
                  this.returnsItems.at(returns[j].originalIndex).get('RecievedFromMaintanceItemsQuantityBox').setValue(current.m_Item4);
                  this.returnsItems.at(returns[j].originalIndex).get('RecievedFromMaintanceItemsQuantityNumber').setValue(current.m_Item5);
                }
              }
            }
            this.translate.currentLang === 'en' ? this.error('The store does not contain the required value') : this.error('المخزن لا يحتوي علي العدد المطلوب');
          } else {
            this.translate.currentLang === 'en' ? this.success('The returns record was successfully edited') : this.success('تم تعديل محضر المرتجع بنجاح');
            this.resetForm();
            this.allReturns.m_Item1[this.currentEditableRow] = value.ObjectReturn[0];
            $('#edit-item').modal('hide');

          }
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    }
  }
  checkAvailabiltyQuantity(stockFrom: number, stockTo: number, itemId: number, maintainanceId: number, boxNum: number, quantityNum: number, index, receiveId: number) {
    if ($(`#${index}`).prop('checked')) {
      if (boxNum === 0 && quantityNum === 0) {
        this.zeroRow = index;
        if (this.translate.currentLang === 'ar') {
          this.error('لا يمكن ان تكون القيمه تساوي صفر');
        } else {
          this.error('Value cannot be zero');
        }
      } else {
        this.request.availableQuantityEdit(stockFrom, stockTo, quantityNum, boxNum, itemId, maintainanceId, receiveId).subscribe(
          value => {
            if (!value.m_Item1) {
              this.zeroRow = index;
              if (this.translate.currentLang === 'ar') {
                this.error('المخزن لا يحتوي علي هذه الكميه ' + value.m_Item4 + ' عنصر');
              } else {
                this.error('The store does not have this quantity the available is' + value.m_Item4 + ' item');
              }
            } else {
              if (index === this.zeroRow) {
                this.zeroRow = -1;
              } else if (this.errorRows.indexOf(index) > -1) {
                this.errorRows = this.errorRows.filter(val => val !== index);
              }
            }

          }
        );
      }
    }
  }
}
