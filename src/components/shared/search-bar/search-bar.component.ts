import {Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {RequestsService} from '../../../services/requests.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit, OnChanges {
  @Input() from: string;
  @Input() stockFrom: number;
  @Output() searchValue: EventEmitter<any> = new EventEmitter();
  searchPageNumber = 1;
  searchResults: any;
  allowScroll = true;
  dataLength: number;
  spinnerMoreData: boolean;
  keyword: string;
  constructor(public translate: TranslateService, private request: RequestsService, private toastr: ToastrService) { }

  ngOnInit() {
    $('#inputSearch').focus();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['stockFrom'].currentValue !== null && (changes['stockFrom'].currentValue !== changes['stockFrom'].previousValue))
    this.clearSearch();
  }
  search(keyword) {
    this.keyword = keyword.toString().trim();
    if (this.keyword) {
      if (this.from === 'transformation') {
        this.request.getItemNameWithSearchTransform(this.searchPageNumber, this.keyword, this.stockFrom).subscribe((values: any) => {
          if (values.m_Item1 !== null) {
            this.searchResults = values;
            this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
          } else {
            this.searchResults.m_Item1 = [];
            this.searchResults.m_Item2 = 0;
          }
      }, error1 => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error1));
      } else {
        this.request.getItemNameWithSearch(this.searchPageNumber, this.keyword).subscribe((values) => {
          this.searchResults = values;
          this.dataLength = (values as any).m_Item2 - (values as any).m_Item1.length;
        }, error1 => this.translate.currentLang === 'ar' ? this.error('حدث خطأ غير متوقع') : this.error(error1));
      }
    }
  }
  loadMoreData() {
    const list = document.getElementById('search-list');
      if((list.offsetHeight + list.scrollTop >= list.scrollHeight) && (this.allowScroll && this.dataLength > 0)) {
        this.allowScroll = false;
        this.spinnerMoreData = true;

        if (this.from === 'transformation') {
          this.request.getItemNameWithSearchTransform(++this.searchPageNumber, this.keyword, this.stockFrom).subscribe((allItems: any) => {
              this.dataLength -= allItems.m_Item1.length;
              this.allowScroll = this.dataLength > 0;
              this.searchResults.m_Item1.push(...allItems.m_Item1);

            }, error => {
              this.error('حدث خطأ غير متوقع');
            }, () => {
              this.spinnerMoreData = false;

            }
          );
        } else {
          this.request.getItemNameWithSearch(++this.searchPageNumber, this.keyword).subscribe((allItems: any) => {
              this.dataLength -= allItems.m_Item1.length;
              this.allowScroll = this.dataLength > 0;
              this.searchResults.m_Item1.push(...allItems.m_Item1);

            }, error => {
              this.error('حدث خطأ غير متوقع');
            }, () => {
              this.spinnerMoreData = false;

            }
          );
        }

      }
  }
  onSelect(value) {
    this.searchValue.emit(value);
    $('#search-container').addClass('hidden');
  }
  hideSearch() {
    $('#search-container').addClass('hidden');
  }
  error(err) {
    this.toastr.error(err);
  }
  clearSearch() {
    this.searchPageNumber = 1;
    this.searchResults = {};
    this.allowScroll = true;
    this.dataLength = 0;
    this.keyword = '';
    $('#inputSearch').val('');
  }
}
