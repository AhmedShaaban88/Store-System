import { Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {RequestsService} from '../../../services/requests.service';
import {IItem} from '../../../interfaces/Item';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
declare var $: any 

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  filter = false;
  search = false;
  items;
  selectedItem: IItem;
  pageNum = 1;
  pageNumAdd = 1;
  pageNumEdit = 1;
  allowScroll = true;
  dataLength: number;
  dataLengthAdd: number;
  dataLengthEdit: number;
  spinnerMoreData: boolean;
  allCategories;
  allCategoriesEdit;
  deleteNo = 0;
  currentEditableItem: number;
  loading = false;
  loadingEdit = false;
  zeroCountAdd: any;
  zeroCountEdit: false;
  addItemForm = this.fb.group({
    name: ['', Validators.required],
    count: [1, Validators.compose([Validators.required, Validators.min(0)])],
    categoryAr: [[], Validators.required],
    specification: [''],
    note: ['']
  });
  updateItemForm = this.fb.group({
    name: ['', Validators.required],
    count: [1, Validators.compose([Validators.required, Validators.min(0)])],
    categoryAr: [[], Validators.required],
    specification: [''],
    note: ['']
  });
  itemCode: number;
  itemId: number;
  itemCategory: any;
  private dropdownSettings: {};
  private keywordCategory: any;
  private keywordCategoryEdit: any;
  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.translate.get('header.links.settings.links.items').subscribe(value => this.title.setTitle(value));
    this.request.getAllItems(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.items = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
    this.dropdownSettings = {
      singleSelection: true,
      text: this.translate.currentLang === 'ar' ?  'اختر الفئه' : 'Choose Category',
      enableSearchFilter: true,
      lazyLoading: true,
      primaryKey: 'value',
      labelKey: 'label',
      classes: 'myclass custom-class',
      enableCheckAll: false,
      showCheckbox: true,
      noDataLabel: this.translate.currentLang === 'ar' ? 'لا يوجد نتائج' : 'No results found',
      searchPlaceholderText: this.translate.currentLang === 'ar' ?  'كلمه البحث' : 'Search'
    };
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      this.request.getAllItems(++this.pageNum, this.deleteNo).subscribe(allItems => {
        this.dataLength -= (allItems as any).m_Item1.length;
        this.allowScroll = this.dataLength > 0;
        this.items = (
            {
              m_Item1: this.items.m_Item1.concat((allItems as any).m_Item1),
              m_Item2: (allItems as any).m_Item2
            }
          );
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }, () => this.spinnerMoreData = false
      );
    }
  }

  loadAllCategories(from: string) {
    if (from === 'add') {
      if (this.translate.currentLang === 'en') {
        this.request.getAllCategoriesEn(this.pageNumAdd, 0).subscribe(allCategories => {
          this.allCategories = allCategories;
          this.dataLengthAdd = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllCategories(this.pageNumAdd, 0).subscribe(allCategories => {
          this.allCategories = allCategories;
          this.dataLengthAdd = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    } else {
      if (this.translate.currentLang === 'en') {
        this.request.getAllCategoriesEn(this.pageNumEdit, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllCategories(this.pageNumEdit, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }



  }

  loadMoreData(evt: any) {
    if ((this.dataLengthAdd > 0 && !this.loading) && evt.endIndex === this.allCategories.m_Item1.length - 1) {
      this.loading = true;
      if (this.keywordCategory && this.keywordCategory.trim() !== '') {
        if (this.translate.currentLang === 'ar') {
          this.request.searchCategory(this.keywordCategory, ++this.pageNumAdd).subscribe((allItems: any) => {
            this.dataLengthAdd -= allItems.m_Item1.length;
            this.allCategories.m_Item1 = this.allCategories.m_Item1.concat(allItems.m_Item1);
            this.loading = false;
          });
        } else {
          this.request.searchCategoryEn(this.keywordCategory, ++this.pageNumAdd).subscribe((allItems: any) => {
            this.dataLengthAdd -= allItems.m_Item1.length;
            this.allCategories.m_Item1 = this.allCategories.m_Item1.concat(allItems.m_Item1);
            this.loading = false;
          });
        }
      } else {
        if (this.translate.currentLang === 'ar') {
          this.request.getAllCategories(++this.pageNumAdd, 0).subscribe((allItems: any) => {
            this.dataLengthAdd -= allItems.m_Item1.length;
            this.allCategories.m_Item1 = this.allCategories.m_Item1.concat(allItems.m_Item1);
            this.loading = false;
          });
        } else {
          this.request.getAllCategoriesEn(++this.pageNumAdd, 0).subscribe((allItems: any) => {
            this.dataLengthAdd -= allItems.m_Item1.length;
            this.allCategories.m_Item1 = this.allCategories.m_Item1.concat(allItems.m_Item1);
            this.loading = false;
          });
        }
      }


    }
  }
  loadMoreDataEdit(evt: any) {
    if ((this.dataLengthEdit > 0 && !this.loadingEdit) && evt.endIndex === this.allCategoriesEdit.m_Item1.length - 1) {
      this.loadingEdit = true;
      if (this.keywordCategoryEdit) {
        if (this.translate.currentLang === 'ar') {
          this.request.searchCategory(this.keywordCategoryEdit, ++this.pageNumEdit).subscribe((allItems: any) => {
            this.dataLengthEdit -= allItems.m_Item1.length;
            this.allCategoriesEdit.m_Item1 = this.allCategoriesEdit.m_Item1.concat(allItems.m_Item1);
            this.loadingEdit = false;
          });
        } else {
          this.request.searchCategoryEn(this.keywordCategoryEdit, ++this.pageNumEdit).subscribe((allItems: any) => {
            this.dataLengthEdit -= allItems.m_Item1.length;
            this.allCategoriesEdit.m_Item1 = this.allCategoriesEdit.m_Item1.concat(allItems.m_Item1);
            this.loadingEdit = false;
          });
        }

      } else {
        if (this.translate.currentLang === 'ar') {
          this.request.getAllCategories(++this.pageNumEdit, 0).subscribe((allItems: any) => {
            this.dataLengthEdit -= allItems.m_Item1.length;
            this.allCategoriesEdit.m_Item1 = this.allCategoriesEdit.m_Item1.concat(allItems.m_Item1);
            this.loadingEdit = false;
          });
        } else {
          this.request.getAllCategoriesEn(++this.pageNumEdit, 0).subscribe((allItems: any) => {
            this.dataLengthEdit -= allItems.m_Item1.length;
            this.allCategoriesEdit.m_Item1 = this.allCategoriesEdit.m_Item1.concat(allItems.m_Item1);
            this.loadingEdit = false;
          });
        }

      }

    }
  }

  onSearchCategory(evt: any) {
    this.keywordCategory = evt.target.value;
    this.pageNumAdd = 1;
    if (this.keywordCategory.toString().trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchCategory(this.keywordCategory, this.pageNumAdd).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(0).css('height', '0');
          } else {
            $('.lazyContainer').eq(0).css('height', '300px');
          }
          this.allCategories = allStores;
          this.dataLengthAdd = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchCategoryEn(this.keywordCategory, this.pageNumAdd).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
            $('.lazyContainer').eq(0).css('height', '0');
          } else {
            $('.lazyContainer').eq(0).css('height', '300px');
          }
          this.allCategories = allStores;
          this.dataLengthAdd = allStores.m_Item2 - allStores.m_Item1.length;
        });
      }
    } else {
     $('.lazyContainer').eq(0).css('height', '0');

      if (this.translate.currentLang === 'en') {
        this.request.getAllCategoriesEn(this.pageNumAdd, 0).subscribe(allCategories => {
          this.allCategories = allCategories;
          this.dataLengthAdd = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllCategories(this.pageNumAdd, 0).subscribe(allCategories => {
          this.allCategories = allCategories;
          this.dataLengthAdd = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
      }

  }
  onSearchCategoryEdit(evt: any) {
    this.keywordCategoryEdit = evt.target.value;
    this.pageNumEdit = 1;
    if (this.keywordCategoryEdit.toString().trim() !== '') {
      if (this.translate.currentLang === 'ar') {
        this.request.searchCategory(this.keywordCategoryEdit, this.pageNumEdit).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
           $('.lazyContainer').css('height', '0');
          } else {
            $('.lazyContainer').css('height', '300px');
          }
          this.allCategoriesEdit = allStores;
          this.dataLengthEdit = allStores.m_Item2 - allStores.m_Item1.length;
        });
      } else {
        this.request.searchCategoryEn(this.keywordCategoryEdit, this.pageNumAdd).subscribe((allStores: any) => {
          if (allStores.m_Item2 === 0) {
           $('.lazyContainer').css('height', '0');
          } else {
            $('.lazyContainer').css('height', '300px');
          }
          this.allCategoriesEdit = allStores;
          this.dataLengthEdit = allStores.m_Item2 - allStores.m_Item1.length;
        });
      }
    }
    else{
      $('.lazyContainer').css('height', '300px');
      if (this.translate.currentLang === 'en') {
        this.request.getAllCategoriesEn(this.pageNumEdit, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllCategories(this.pageNumEdit, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    }


  }
  resetSearchAdd() {
    this.keywordCategory = '';
    $('.list-filter input').val('');
    $('.lazyContainer').eq(0).css('height', '300px');
    this.zeroCountAdd = false;

  }
  resetSearchEdit() {
    this.keywordCategoryEdit = '';
    $('.list-filter input').val('');
    $('.lazyContainer').css('height', '300px');
    this.zeroCountEdit = false;

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
      this.request.deleteItem(this.selectedItem.ItemsId).subscribe(value => {
          this.items.m_Item1 = this.items.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.items.m_Item2 = this.items.m_Item2 - 1;
          this.deleteNo++;
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }

  addItemSubmit() {
    this.request.addItem({
      CategoryId_FK: this.addItemForm.get('categoryAr').value[0].value,
      ItemsName: this.addItemForm.get('name').value,
    ItemSpecification: this.addItemForm.get('specification').value,
    ItemBoxQuantity: this.addItemForm.get('count').value,
    ItemNote: this.addItemForm.get('note').value,
    }).subscribe(value => {
          this.translate.currentLang === 'en' ? this.success('item added successfully') : this.success('تم اضافه الصنف بنجاح');
          if (this.items.m_Item1.length % 30 === 0) {
                this.items.m_Item1.pop();
          } else {
            this.items.m_Item2++;

          }
          this.items.m_Item1 = [
          value,
          ...this.items.m_Item1
        ];


      }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    this.addItemForm.reset();
    $('#add-item').modal('hide');
    this.resetSearchAdd();
    }
    updateItemSubmit() {
    this.request.updateItem({
      CategoryId_FK: this.updateItemForm.get('categoryAr').value[0].value,
      ItemsId: this.itemId,
      ItemsName: this.updateItemForm.get('name').value,
    ItemSpecification: this.updateItemForm.get('specification').value,
    ItemBoxQuantity: this.updateItemForm.get('count').value,
    ItemNote: this.updateItemForm.get('note').value,
    }).subscribe(value => {
          this.translate.currentLang === 'en' ? this.success('item updated successfully') : this.success('تم تحديث الصنف بنجاح');
          this.items.m_Item1[this.currentEditableItem] = value;
      }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
    this.updateItemForm.reset();
    $('#update-item').modal('hide');
    this.resetSearchEdit();
    }
    updateForm(item, index) {
      if (this.translate.currentLang === 'en') {
        this.request.getAllCategoriesEn(this.pageNumEdit = 1, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;

        }, error => {
          this.error(error);
        });
      } else {
        this.request.getAllCategories(this.pageNumEdit = 1, 0).subscribe(allCategories => {
          this.allCategoriesEdit = allCategories;
          this.dataLengthEdit = (allCategories as any).m_Item2 - (allCategories as any).m_Item1.length;
        }, error => {
          this.error('حدث خطأ غير متوقع');
        });
      }
    this.currentEditableItem = index;
    this.updateItemForm.patchValue({
      name: item.ItemsName,
      count: item.ItemBoxQuantity,
      categoryAr: item.CategoryId_FK,
      specification: item.ItemSpecification,
      note: item.ItemNote
    });

    this.itemCategory = [{
      CategoryId: item.CategoryId_FK,
      label: this.translate.currentLang === 'ar' ? item.CategoryNameAr : item.CategoryNameEn,
      value: item.CategoryId_FK
    }];
    this.itemCode = item.ItemsCode;
    this.itemId = item.ItemsId;

    }
  checkCategory(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
  }
  checkCategoryEdit(ele) {
    if (ele.value === null || ele.value.length === 0) {
      ele.errors = 'empty';
    } else {
      ele.errors = null;
    }
  }
  focusCategory() {
    $('.c-btn').eq(0).click();
  }
  focusCategoryEdit() {
    $('.c-btn').click();
  }
  checkCountAdd(val) {
    this.zeroCountAdd = val <= 0;
    if (this.zeroCountAdd) {
      if (this.translate.currentLang === 'ar') {
        this.error('لابد ان تكون العبوه اكبر من صفر');
      }else{
        this.error('Value must be more than zero');
      }
    }
  }

}
