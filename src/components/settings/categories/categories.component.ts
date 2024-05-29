import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {ICategory} from '../../../interfaces/Category';
import {FormBuilder, Validators} from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';
declare var $: any;
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories;
  selectedItem: ICategory;
  pageNum = 1;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  deleteNo = 0;
  currentEditableItem: ICategory;
  searchPageNo = 1;
  keyword: string;
  sortCol: string;
  sortType: string;
  addItemForm = this.fb.group({
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
  });
  updateItemForm = this.fb.group({
    code: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
  });
  private currentEditableIndex: number;
  constructor(public translate: TranslateService, private title: Title,
              private request: RequestsService, private toastr: ToastrService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.translate.get('header.links.settings.links.categories').subscribe(value =>  this.title.setTitle(value));
    this.request.getAllCategories(this.pageNum, this.deleteNo).subscribe(allItems => {
      this.categories = allItems;
      this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

    }, error => {
      this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
    });
  }
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 24) && (this.allowScroll && this.dataLength > 0)) {
      this.allowScroll = false;
      this.spinnerMoreData = true;
      if (this.keyword !== '' && !this.sortCol && !this.sortType) {
        this.request.getAllCategories(++this.pageNum, this.deleteNo).subscribe(allItems => {
            this.dataLength -= (allItems as any).m_Item1.length;
            this.allowScroll = this.dataLength > 0;
            this.categories = (
              {
                m_Item1: this.categories.m_Item1.concat((allItems as any).m_Item1),
                m_Item2: (allItems as any).m_Item2
              }
            );
          }, error => {
            this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
          }, () => this.spinnerMoreData = false
        );
      } else {
        this.request.sortSearchCategory(++this.searchPageNo, this.deleteNo, this.keyword, this.sortType, this.sortCol).subscribe(allItems => {
            this.dataLength -= (allItems as any).m_Item1.length;
            this.allowScroll = this.dataLength > 0;
            this.categories = (
              {
                m_Item1: this.categories.m_Item1.concat((allItems as any).m_Item1),
                m_Item2: (allItems as any).m_Item2
              }
            );
          }, error => {
            this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
          }, () => this.spinnerMoreData = false
        );
      }

    }
  }
  sort(current) {
    this.searchPageNo = 1;
    this.allowScroll = true;
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
      this.request.sortSearchCategory(this.searchPageNo, this.deleteNo, this.keyword, this.sortType, this.sortCol).subscribe((values) => {
        this.categories = values;
        this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
      }, error => this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع'));
    } else {
      sortType.removeClass('fa-sort-down');
      sortType.addClass('fa-sort-up');
      this.sortType = 'caret';
      this.request.sortSearchCategory(this.searchPageNo, this.deleteNo, this.keyword, this.sortType, this.sortCol).subscribe((values) => {
        this.categories = values;
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
  deleteItem() {
    if (this.selectedItem) {
      this.request.deleteCategory(this.selectedItem.CategoryId).subscribe(value => {
          this.categories.m_Item1 = this.categories.m_Item1.filter((val) => {
              return val !== this.selectedItem;
            },
          );
          this.dataLength = --this.dataLength;
          this.translate.currentLang === 'en' ? this.success('item deleted successfully') : this.success('تم مسح العنصر بنجاح');
          this.categories.m_Item2 = this.categories.m_Item2 - 1;
          this.deleteNo++;
        }, error => {
          this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
        }
      );
      $('#delete-item').modal('hide');
    }
  }
  addItemSubmit() {
    this.request.addCategory(
    {
        CategoryNameAr: this.addItemForm.get('nameAr').value,
        CategoryNameEn: this.addItemForm.get('nameEn').value,
    }).subscribe(value => {
        this.translate.currentLang === 'en' ? this.success('item added successfully') : this.success('تم اضافه الصنف بنجاح');
        if (this.categories.m_Item1.length % 10 === 0) {
          this.categories.m_Item1.pop();
        } else {
          this.categories.m_Item2++;

        }
        this.categories.m_Item1 = [
          value,
          ...this.categories.m_Item1
        ];

      }, error => {
        this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
      }
    );
    this.addItemForm.reset();
    $('#add-category').modal('hide');
  }
  updateForm(item, index) {
    this.currentEditableIndex = index;
    this.currentEditableItem = item;
    this.updateItemForm.patchValue({
      code: this.currentEditableItem.CategoryCode,
      nameAr: this.currentEditableItem.CategoryNameAr,
      nameEn: this.currentEditableItem.CategoryNameEn,
    });
  }
  updateItemSubmit() {
    this.request.updateCategory(
    {
      CategoryId: this.currentEditableItem.CategoryId,
      CategoryNameAr: this.updateItemForm.get('nameAr').value,
      CategoryNameEn: this.updateItemForm.get('nameEn').value,
      CategoryCode: this.currentEditableItem.CategoryCode
    }).subscribe(value => {
      this.translate.currentLang === 'en' ? this.success('item updated successfully') : this.success('تم تحديث الصنف بنجاح');
      this.categories.m_Item1[this.currentEditableIndex] = value;

      }, error => {
        this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
      }
    );
    this.updateItemForm.reset();
    $('#update-item').modal('hide');
  }
  search(keyword) {
    this.allowScroll = true;
    this.pageNum = 1;
    this.searchPageNo = 1;
    this.sortType = '';
    this.sortCol = '';
    $('th span i').each((i, v) => {
        $(v).removeClass('fa-sort-up');
        $(v).removeClass('fa-sort-down');
    });
    this.keyword = keyword.toString().trim();
    if (this.keyword) {
          this.request.sortSearchCategory(this.searchPageNo, this.deleteNo, this.keyword, this.sortType, this.sortCol).subscribe((values) => {
            this.categories = values;
            this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
          }, error => this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع')
    );
    } else {
      this.checkReset('');
    }
  }
  checkReset(keyword) {
    if (keyword === '') {
      this.sortType = '';
      this.sortCol = '';
      this.keyword = '';
      $('th span i').each((i, v) => {
        $(v).removeClass('fa-sort-up');
        $(v).removeClass('fa-sort-down');
      });
      this.request.getAllCategories(this.pageNum, this.deleteNo).subscribe(allItems => {
        this.categories = allItems;
        this.dataLength = (allItems as any).m_Item2 - (allItems as any).m_Item1.length;

      }, error => {
        this.translate.currentLang === 'en' ? this.error(error) : this.error('حدث خطأ غير متوقع');
      });
    }
  }

}
