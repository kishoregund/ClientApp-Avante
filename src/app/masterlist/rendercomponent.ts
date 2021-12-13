import {Component} from '@angular/core';
import {first} from 'rxjs/operators';
import {AgRendererComponent} from 'ag-grid-angular';
import {
  AlertService,
  ConfigTypeValueService,
  ContactService,
  CountryService,
  CurrencyService,
  CustomerService,
  CustomerSiteService,
  DistributorRegionService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService,
  UserProfileService
} from '../_services';
import {PrevchklocpartelementService} from "../_services/prevchklocpartelement.service";

@Component({
  template: `
<button class="btn btn-link" data-action-type="remove" (click)="delete(params)"><i class="fas fa-trash-alt" title="Delete"></i></button>
<button class="btn btn-link" *ngIf="params.addAccess" data-action-type="add" ><i class="fas fa-plus-circle" title="Add Value" data-action-type="add"></i></button>
<button class="btn btn-link" *ngIf="params.hasUpdateAccess" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>
`
})
export class MRenderComponent implements AgRendererComponent  {
  params: any;

  constructor(private distributorService: DistributorService,
              private distributorRegionService: DistributorRegionService,
              private alertService: AlertService,
              private contactService: ContactService,
              private custsiteService: CustomerSiteService,
              private sparepartService: SparePartService,
              private instrumnetservice: InstrumentService,
              private customerservice: CustomerService,
              private notificationService: NotificationService,
              private profileService: ProfileService,
              private userprofileService: UserProfileService,
              private currencyService: CurrencyService,
              private countryService: CountryService,
              private listTypeService: ListTypeService,
              private configService: ConfigTypeValueService,
              private prevchklocpartelementService: PrevchklocpartelementService,
  ) {

  }
  agInit(params: any): void {
    //debugger;
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }


  delete(params: any) {
    //debugger;
    if (confirm("Are you sure, you want to delete the record?") == true) {
      if (params.deleteLink == "D") {
        //debugger;
        this.distributorService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              //debugger;
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              }
              else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      }
      else if (params.deleteLink == "LITYIT") {
        //debugger;
        this.listTypeService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      }
      else if (params.deleteLink == "ELEMENT") {
        //debugger;
        this.prevchklocpartelementService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CNG") {
        //debugger;
        this.configService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      }
    }
  }
}
