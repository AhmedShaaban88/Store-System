import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {IStock} from '../../../interfaces/Stock';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, Validators} from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  stocks;
  selectedItem: IStock;
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  active;
  currentCheckBox;
  firstTimeLoaded = false;
  firstTimeLoadedStockType = false;
  places: any;
  floors: any;
  floorsEdit: any;
  offices: any;
  officesEdit: any;
  stockTypes: any;
  activationStatus = [
    {
      label: 'مفعل',
      value: true
    },
    {
      label: 'معطل',
      value: false
    }
  ];
  activationStatusEn = [
    {
      label: 'Active',
      value: true
    },
    {
      label: 'Disabled',
      value: false
    }
  ];
  placesSearch: any;
  placesPageNo = 1;
  placesDataLength: number;
  kewordPlace: any;
  searchPageNo = 1;
  keyword: string;
  sortCol: string;
  sortType: string;
  addItemForm = this.fb.group({
    StockNameAr: ['', Validators.required],
    StockNameEn: ['', Validators.required],
    StockTypeId_FK: [[], Validators.required],
    PlaceId_FK: [[], Validators.required],
    FloorId_FK: [[], Validators.required],
    OfficeId_FK: [[], Validators.required],
  });
  searchItemForm = this.fb.group({
    searchKeyword: [''],
    stockId: [[]],
    placeId: [[]],
    activeStatus: [[]],
  });
  updateItemForm = this.fb.group({
    StockNameAr: ['', Validators.required],
    StockNameEn: ['', Validators.required],
    StockTypeId_FK: [[], Validators.required],
    PlaceId_FK: [[], Validators.required],
    FloorId_FK: [[], Validators.required],
    OfficeId_FK: [[], Validators.required],
  });
  currentEditablePlace: any;
  currentEditableFloor: any;
  currentEditableOffice: any;
  currentEditableStockType: any;
  private dropdownSettings: {};
  private currentEditableItem: number;
  private stockSetting: { text: string };
  private placeSetting: any;
  private activeSetting: { text: string };
  private loadingFrom = false;
  constructor(public translate: TranslateService, private title: Title
  ,           private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.translate.get('header.links.settings.links.stocks').subscribe(value =>  this.title.setTitle(value));
    this.request.getAllStocks(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.stocks = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
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
    this.stockSetting = {
      ... this.dropdownSettings,
      text: this.translate.currentLang === 'ar' ?  'اختر نوع المخزن' : 'Choose Stock Type',
    };
    this.placeSetting = {
      ... this.dropdownSettings,
      primaryKey: 'PlaceId',
      labelKey: 'place',
      enableSearchFilter: true,
      lazyLoading: true,
      text: this.translate.currentLang === 'ar' ?  'اختر المكان' : 'Choose Place',
    };
    this.activeSetting = {
      ... this.dropdownSettings,
      text: this.translate.currentLang === 'ar' ?  'التفعيل ' : 'Choose Activation Status',
    };
    this.loadAllStockTypes();
    this.request.getAllCollages(this.placesPageNo).subscribe(allItems => {
      this.placesSearch = allItems.m_Item1;

      this.placesDataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
  }
  stopClicking(e) {
    if (e.target.tagName.indexOf('BUTTON') === -1) {
      e.stopPropagation();
    }
  }
  @HostListener('window:scroll', [])
  onScroll(): void {
    const searchKey =  !!this.searchControls.searchKeyword.value;
    const stockId =  this.searchControls.stockId.value.length > 0;
    const placeId =  this.searchControls.placeId.value.length > 0;
    const active =  this.searchControls.activeStatus.value.length > 0;
    const searchKeyVal =  this.searchControls.searchKeyword.value ? this.searchControls.searchKeyword.value : '';
    const stockIdVal =  this.searchControls.stockId.value.length > 0 ? this.searchControls.stockId.value[0].value : '';
    const placeIdVal =  this.searchControls.placeId.value.length > 0 ? this.searchControls.placeId.value[0].PlaceId : '';
    const activeVal =  this.searchControls.activeStatus.value.length > 0 ? this.searchControls.activeStatus.value[0].value : null;
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      if (!this.sortType && !this.sortCol && !searchKey && !stockId && !placeId && !active) {
        this.request.getAllStocks(++this.pageNum, this.deleteNo).subscribe(allItems => {
            this.dataLength -= (allItems as any).m_Item1.length;
            this.allowScroll = this.dataLength > 0;
            this.stocks = (
              {
                m_Item1: this.stocks.m_Item1.concat((allItems as any).m_Item1),
                m_Item2: (allItems as any).m_Item2
              }
            );
          }, error => {
            this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
          }, () => this.spinnerMoreData = false
        );
      } else {
        this.request.sortSearchStock(++this.searchPageNo, this.deleteNo, searchKeyVal, this.sortType, this.sortCol, stockIdVal , placeIdVal,  activeVal).subscribe((allItems) => {
          if ((allItems as any).m_Item1 === null) {
            this.stocks.m_Item1 = [];
            this.stocks.m_Item2 = 0;
          } else {
            this.dataLength -= (allItems as any).m_Item1.length;
            this.allowScroll = this.dataLength > 0;
            this.stocks = (
              {
                m_Item1: this.stocks.m_Item1.concat((allItems as any).m_Item1),
                m_Item2: (allItems as any).m_Item2
              }
            );
          }

          }, error => {
            this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
          }, () => this.spinnerMoreData = false
        );
      }

    }
  }
  get searchControls() {
    return this.searchItemForm.controls;
  }
  sort(current) {
    this.searchPageNo = 1;
    this.allowScroll = true;
   const searchKey =  this.searchControls.searchKeyword.value ? this.searchControls.searchKeyword.value : '';
   const stockId =  this.searchControls.stockId.value.length > 0 ? this.searchControls.stockId.value[0].value : '';
   const placeId =  this.searchControls.placeId.value.length > 0 ? this.searchControls.placeId.value[0].PlaceId : '';
   const active =  this.searchControls.activeStatus.value.length > 0 ? this.searchControls.activeStatus.value[0].value : null;
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
      this.sortType = 'caret sorted';
      this.request.sortSearchStock(this.searchPageNo, this.deleteNo, searchKey, this.sortType, this.sortCol, stockId , placeId,  active).subscribe((values) => {
        this.stocks = values;
        this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
      }, error => this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع'));
    } else {
      sortType.removeClass('fa-sort-down');
      sortType.addClass('fa-sort-up');
      this.sortType = 'caret';
      this.request.sortSearchStock(this.searchPageNo, this.deleteNo, searchKey, this.sortType, this.sortCol, stockId , placeId,  active).subscribe((values) => {
        this.stocks = values;
        this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
      }, error => this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع'));
    }

  }


  error(err) {
    this.toastr.error(err);
  }
  success(msg) {
    this.toastr.success(msg);
  }
  changeCheckBox(target: any, item) {
    $('#toggle-item').modal('show');
    this.currentCheckBox = $(target);
    this.selectedItem = item;
      if (this.translate.currentLang === 'ar') {
        if ($(target).prop('checked')) {
          this.active = 'تمكين';
        } else {
          this.active = 'تعطيل';
        }
      } else {
        if ($(target).prop('checked')) {
          this.active = 'Active';

        } else {
          this.active = 'Disable';
        }
      }
  }
  changeStatus(bool: boolean) {
    if (bool) {
      this.request.toggleActivation(this.currentCheckBox.prop('checked'), this.selectedItem.StockId).
        subscribe((value: any) => {
          if (value.result === true) {
            if (this.translate.currentLang === 'ar') {
              if (this.currentCheckBox.prop('checked')) {
                this.currentCheckBox.next('label').text('تمكين');
                this.currentCheckBox.parents().eq(4).removeClass('bg-secondary');
              } else {
                this.currentCheckBox.next('label').text('تعطيل');
                this.currentCheckBox.parents().eq(4).addClass('bg-secondary');
              }
            } else {
              if (this.currentCheckBox.prop('checked')) {
                this.currentCheckBox.next('label').text('Active');
                this.currentCheckBox.parents().eq(4).removeClass('bg-secondary');
              } else {
                this.currentCheckBox.next('label').text('Disable');
                this.currentCheckBox.parents().eq(4).addClass('bg-secondary');
              }
            }
          } else {
            this.translate.currentLang === 'en' ? this.error('This store cannot be disabled because it contains items') : this.error('لا يمكن تعطيل هذا المخزن لانه يحتوي علي اصناف قم بتفريغه اولا');
            this.currentCheckBox.prop('checked', !this.currentCheckBox.prop('checked'));

          }
      },
        error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع'); });

    } else {
      this.currentCheckBox.prop('checked', !this.currentCheckBox.prop('checked'));
    }
    $('#toggle-item').modal('hide');

  }
  deleteItem() {
    if (this.selectedItem) {
      this.request.deleteStock(this.selectedItem.StockId).subscribe((value: any) => {
        if (value.m_Item1) {
          this.stocks.m_Item1 = this.stocks.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.stocks.m_Item2 = this.stocks.m_Item2 - 1;
          this.deleteNo++;
        } else {
         switch (value.m_Item2) {
           case '1':
             this.translate.currentLang === 'en' ? this.error('This store exists in damage bond') : this.error('هذا المخزن يوجد في سند التوريد');
             break;
          case '2':
             this.translate.currentLang === 'en' ? this.error('This store exists in Store damage') : this.error('هذا المخزن يوجد في مخزن الصيانه');
             break;
             case '3':
             this.translate.currentLang === 'en' ? this.error('This store exists in Returns') : this.error('هذا المخزن يوجد في مرتجعات');
             break;
             case '4':
             this.translate.currentLang === 'en' ? this.error('This store contains Employees') : this.error('هذا المخزن به موظفين ');
             break;
             case '5':
             this.translate.currentLang === 'en' ? this.error('This store contains Transfer authorization') : this.error('هذا المخزن به اذن تحويل');
             break;
             case '6':
             this.translate.currentLang === 'en' ? this.error('This store contains Items') : this.error('هذا المخزن به اصناف');
             break;

         }
        }


        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }
  loadAllPlaces() {
    this.addItemForm.reset();
    if (!this.firstTimeLoaded) {
      if (this.translate.currentLang === 'en') {
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
      this.firstTimeLoaded = true;
    }

  }
  loadAllStockTypes() {
    if (!this.firstTimeLoadedStockType) {
      if (this.translate.currentLang === 'en') {
        this.request.getAllStockTypesEn().subscribe(allStocks => {
          this.stockTypes = allStocks;
        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllStockTypes().subscribe(allStocks => {
          this.stockTypes = allStocks;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
      this.firstTimeLoadedStockType = true;
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
  changeFloorEdit(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getOfficeInFloorEn(id).subscribe(allOffices => {
        this.updateItemForm.patchValue({
          OfficeId_FK: ''
        });
        this.officesEdit = allOffices;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.getOfficeInFloor(id).subscribe(allOffices => {
        this.updateItemForm.patchValue({
          OfficeId_FK: ''
        });
        this.officesEdit = allOffices;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }

  }
  changeFacultyEditMode(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getFloorInPlaceEn(id).subscribe(allFloors => {
        this.floorsEdit = allFloors;
        this.currentEditableFloor = [{}];
        this.updateItemForm.patchValue({
          FloorId_FK: '',
          OfficeId_FK: ''
        });
        this.officesEdit = undefined;

      }, error => {
        this.error(error);
      });
    } else {
      this.request.getFloorInPlace(id).subscribe(allFloors => {
        this.floorsEdit = allFloors;
        this.currentEditableFloor = [{}];
        this.updateItemForm.patchValue({
          FloorId_FK: '',
          OfficeId_FK: ''
        });
        this.officesEdit = undefined;

      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
  }
  getAllOfficesEdit(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getOfficeInFloorEn(id).subscribe(allOffices => {
        this.officesEdit = allOffices;
      }, error => {
        this.error(error);
      });
    } else {
      this.request.getOfficeInFloor(id).subscribe(allOffices => {
        this.officesEdit = allOffices;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
  }
  getAllFloorsEdit(id) {
    if (this.translate.currentLang === 'en') {
      this.request.getFloorInPlaceEn(id).subscribe(allFloors => {
        this.floorsEdit = allFloors;

      }, error => {
        this.error(error);
      });
    } else {
      this.request.getFloorInPlace(id).subscribe(allFloors => {
        this.floorsEdit = allFloors;
      }, error => {
        this.error('حدث خطأ غير متوقع');
      });
    }
  }
  addItemSubmit() {
    this.request.addStock({
      StockNameAr: this.addItemForm.get('StockNameAr').value,
      StockNameEn: this.addItemForm.get('StockNameEn').value,
      StockTypeId_FK: this.addItemForm.get('StockTypeId_FK').value[0].value,
      PlaceId_FK: this.addItemForm.get('OfficeId_FK').value[0].value,
    }).subscribe(value => {
        this.translate.currentLang === 'en' ? this.success('store added successfully') : this.success('تم اضافه المخزن بنجاح');
        if (this.stocks.m_Item1.length % 10 === 0) {
          this.stocks.m_Item1.pop();
        } else {
          this.stocks.m_Item2++;

        }
        this.stocks.m_Item1 = [
          value[0],
          ...this.stocks.m_Item1
        ];


      }, error => {
        this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
      }
    );
    this.addItemForm.reset();
    $('#add-stock').modal('hide');
  }
  updateForm(item, index) {
    this.selectedItem = item;
    this.currentEditableItem = index;
    const placeName = item.place.split('-')[0] || '';
    const floorName = item.place.split('-')[1] || '';
    const roomName = item.place.split('-')[2] || '';
    this.currentEditablePlace = [{
      PlaceId: item.ColledgeId,
      PlaceNameAr: placeName,
      label: placeName,
      value: item.ColledgeId
    }];
    this.currentEditableFloor = [{
      PlaceId: item.FloorId,
      PlaceNameAr: floorName,
      label: floorName,
      value: item.FloorId
    }];
    this.currentEditableOffice = [{
      PlaceId: item.PlaceId,
      PlaceNameAr: roomName,
      label: roomName,
      value: item.PlaceId
    }];
    this.currentEditableStockType = [{
      StockTypesId: item.StockTypeId_FK,
      label: this.translate.currentLang === 'ar' ? item.StockTypesNameAr : item.StockTypesNameEn,
      value: item.StockTypeId_FK
    }];
    this.loadAllPlaces();
    this.getAllFloorsEdit(item.ColledgeId);
    this.getAllOfficesEdit(item.FloorId);
    this.updateItemForm.patchValue({
      StockNameAr: item.StockNameAr,
      StockNameEn: item.StockNameEn,
      StockTypeId_FK: this.currentEditableStockType,
      PlaceId_FK: this.currentEditablePlace,
      FloorId_FK: this.currentEditableFloor,
      OfficeId_FK: this.currentEditableOffice,
    });
  }
  updateItemSubmit() {
    this.request.updateStock({
      StockId: this.selectedItem.StockId,
      StockNameAr: this.updateItemForm.get('StockNameAr').value,
      StockNameEn: this.updateItemForm.get('StockNameEn').value,
      StockTypeId_FK: this.updateItemForm.get('StockTypeId_FK').value[0].value,
      PlaceId_FK: this.updateItemForm.get('OfficeId_FK').value[0].value,
    }).subscribe((value: any) => {
      if (value.m_Item1) {
        this.translate.currentLang === 'en' ? this.success('Store updated successfully') : this.success('تم تحديث المخزن بنجاح');
        this.stocks.m_Item1[this.currentEditableItem] = value.m_Item3[0];
      } else {
        switch (value.m_Item2) {
          case 1:
            this.translate.currentLang === 'en' ? this.error('This store exists in damage bond') : this.error('هذا المخزن يوجد في سند التوريد');
            break;
          case 2:
            this.translate.currentLang === 'en' ? this.error('This store exists in Store damage') : this.error('هذا المخزن يوجد في مخزن الصيانه');
            break;
          case 3:
            this.translate.currentLang === 'en' ? this.error('This store exists in Returns') : this.error('هذا المخزن يوجد في مرتجعات');
            break;
          case 4:
            this.translate.currentLang === 'en' ? this.error('This store contains Employees') : this.error('هذا المخزن به موظفين ');
            break;
          case 5:
            this.translate.currentLang === 'en' ? this.error('This store contains Transfer authorization') : this.error('هذا المخزن به اذن تحويل');
            break;
          case 6:
            this.translate.currentLang === 'en' ? this.error('This store contains Items') : this.error('هذا المخزن به اصناف');
            break;
          case 7:
            this.translate.currentLang === 'en' ? this.success('Store updated successfully') : this.success('تم تحديث المخزن بنجاح');
           break;

        }
      }

      }, error => {
        this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
      }
    );
    this.updateItemForm.reset();
    $('#update-item').modal('hide');
  }
  onSearch(evt: any) {
    this.kewordPlace = evt.target.value;
    this.placesPageNo = 1;
    if (this.kewordPlace.trim() !== '') {
        this.request.searchGetAllCollages(this.placesPageNo , this.kewordPlace).subscribe((allPlaces: any) => {
          if (allPlaces.m_Item2 === 0) {
            $('.lazyContainer').eq(1).css('height', '0');
          } else {
            $('.lazyContainer').eq(1).css('height', '300px');
          }
          this.placesSearch = allPlaces.m_Item1;
          this.placesDataLength = allPlaces.m_Item2 - allPlaces.m_Item1.length;
        });

    } else {
        $('.lazyContainer').eq(1).css('height', '300px');
        this.request.getAllCollages(this.placesPageNo = 1).subscribe((allPlaces: any) => {
          this.placesSearch = allPlaces.m_Item1;
          this.placesDataLength = allPlaces.m_Item2 - allPlaces.m_Item1.length;
        }, error => {
          this.error(error);
        });

    }

  }

  loadMorePlacesSearch(event: any) {
    if ((this.placesDataLength > 0 && !this.loadingFrom) && event.endIndex === this.placesSearch.length - 1) {
      this.loadingFrom = true;
      if (this.kewordPlace && this.kewordPlace.trim() !== '') {
          this.request.searchGetAllCollages(++this.placesPageNo, this.kewordPlace).subscribe((allItems: any) => {
            this.placesDataLength -= allItems.m_Item1.length;
            this.placesSearch = this.placesSearch.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
      } else {
          this.request.getAllCollages(++this.placesPageNo).subscribe((allItems: any) => {
            this.placesDataLength -= allItems.m_Item1.length;
            this.placesSearch = this.placesSearch.concat(allItems.m_Item1);
            this.loadingFrom = false;
          });
      }
    }
  }

  focusPlaceAdd() {
    $('.c-btn').eq(0).click();
  }
  checkPlaceValueAdd(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusFloorAdd() {
    $('.c-btn').eq(1).click();
  }
  checkFloorValueAdd(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusOfficeAdd() {
    $('.c-btn').eq(2).click();
  }
  checkOfficeValueAdd(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }


  }
  focusStockAdd() {
    $('.c-btn').click();

  }
  checkStockValueAdd(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusPlaceUpdate() {
    $('.c-btn').eq(2).click();
  }
  checkPlaceValueUpdate(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusFloorUpdate() {
    $('.c-btn').eq(3).click();
  }
  checkFloorValueUpdate(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusOfficeUpdate() {
    $('.c-btn').eq(4).click();
  }
  checkOfficeValueUpdate(ele) {

    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  focusStockUpdate() {
    $('.c-btn').eq(5).click();
  }
  checkStockValueUpdate(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }

  }
  searchItemSubmit() {
      this.searchPageNo = 1;
      this.pageNum = 1;
      this.allowScroll = true;
    this.sortType = '';
    this.sortCol = '';
      const searchKey =  this.searchControls.searchKeyword.value ? this.searchControls.searchKeyword.value : '';
      const stockId =  this.searchControls.stockId.value.length > 0 ? this.searchControls.stockId.value[0].value : '';
      const placeId =  this.searchControls.placeId.value.length > 0 ? this.searchControls.placeId.value[0].PlaceId : '';
      const active =  this.searchControls.activeStatus.value.length > 0 ? this.searchControls.activeStatus.value[0].value : null;
      $('th span i').each((i, v) => {
          $(v).removeClass('fa-sort-up');
          $(v).removeClass('fa-sort-down');
      });
      if (searchKey === '' && stockId === '' && placeId === '' && active === null) {
        this.request.getAllStocks(this.pageNum, this.deleteNo).subscribe(allItems => {
          this.stocks = allItems;
          this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        });
      } else {
        this.request.sortSearchStock(this.searchPageNo, this.deleteNo, searchKey, this.sortType, this.sortCol, stockId , placeId,  active).subscribe((values) => {
          if (values.m_Item1 === null) {
            this.stocks.m_Item1 = [];
            this.stocks.m_Item2 = 0;
          } else {
            this.stocks = values;
            this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
          }

        }, error => this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع'))};
  }
}
