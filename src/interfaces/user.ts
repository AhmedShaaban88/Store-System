export class User {
    Username :string;
    Language:boolean;
    JobName:string;
    UserId:number ;
    EmpName:string ;
    Gendar : boolean;
    ImageUserPath :string;
    token?: string;
 }
 export class ModuleData {
   ModuleNameAr:string;
     ModuleNameEn :string;
    ModuleId :number ;
  }
  export class ModuleCategory {
    ModuleCategoryArgb :number ;
     ModuleCategoryIcon :string;
     ModuleCategoryId :number ;
     ModuleCategoryNameAr:string;
    ModuleCategoryNameEn:string;
    ModuleId: number;
  }
  export class PageData {
     PageAuthorizeIcon   :string;
     PageAuthorizeUrl    :string;
     PageAuthorizeNameAr :string;
     PageAuthorizeNameEn :string;
     ModuleCategoryId :number;
     PageAuthorizeId :number ;
  }