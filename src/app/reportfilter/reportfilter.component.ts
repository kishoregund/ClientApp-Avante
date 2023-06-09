import { trigger, transition, style, animate } from '@angular/animations';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { User } from '../_models';
import { AccountService, CountryService, CustomerService, InstrumentService, NotificationService, DistributorRegionService, ListTypeService } from '../_services';
import { EnvService } from '../_services/env/env.service';

@Component({
  selector: 'app-reportfilter',
  templateUrl: './reportfilter.component.html',
})
export class ReportfilterComponent implements OnInit {

  @Output() nData = new EventEmitter<any[]>()
  @Output() showData = new EventEmitter<boolean>()

  @Input() controller: string;
  @Input() hasInstrument: boolean = true;
  @Input() isUserProfile: boolean = false;
  @Input() hasSite: boolean = true;

  isAmc = false;
  form: FormGroup;
  modal: any;
  user: User
  nlist: any[] = []

  countryList: any;

  allRegionsList: any;
  regionsList: any[] = [];
  regionCountryList: any;
  customerList: any;
  siteList: any;
  instrumentList: any;
  siteBInstrumentList: any;
  customerBCountryList: any[] = []


  IsDist = false;
  IsCust = false;
  IsEng = false;
  serviceTypeList: any;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private instrumentService: InstrumentService,
    private notificationService: NotificationService,
    private regionService: DistributorRegionService,
    private listtypeService: ListTypeService,
    private environment: EnvService,
  ) { }

  ngOnInit(): void {
    this.isAmc = this.controller == "AMC";
    if (this.isAmc) {
      this.listtypeService.getById("SERTY")
        .pipe(first()).subscribe((data: any) =>
          this.serviceTypeList = data
        )
    }


    this.user = this.accountService.userValue;
    var role = JSON.parse(localStorage.getItem('roles'));

    if (this.user.username != "admin") {
      role = role[0]?.itemCode;

      switch (role) {
        case this.environment.distRoleCode:
          this.IsDist = true
          this.IsCust = false
          this.IsEng = false
          break;

        case this.environment.custRoleCode:
          this.IsDist = false
          this.IsCust = true
          this.IsEng = false
          break;

        case this.environment.engRoleCode:
          this.IsDist = false
          this.IsCust = false
          this.IsEng = true
          break;

        default:
          this.IsDist = false
          this.IsCust = false
          this.IsEng = false
          break;
      }


    }

    this.form = this.formBuilder.group({
      region: ["", [Validators.required]],
      country: ["", [Validators.required]],
      customer: ["", [Validators.required]],
      site: [""],
      insSerialNo: [""],
      sDate: ["", [Validators.required]],
      eDate: ["", [Validators.required]],
      serviceType: [""],
    })

    this.form.get("region").valueChanges.subscribe((data) => {
      this.onRegionChange(data)
    })

    this.form.get("country").valueChanges.subscribe((data) => {
      this.countryChange(data)
    })

    this.form.get("customer").valueChanges.subscribe((data) => {
      this.onCustomerChange(data)
    })

    this.form.get("site").valueChanges.subscribe((data) => {
      this.SiteChange(data)
    })

    this.accountService.GetUserRegions().pipe(first())
      .subscribe((data: any) => {
        this.regionService.getAll().pipe(first())
          .subscribe((dataReg: any) => {
            this.allRegionsList = dataReg;
            data.object.forEach(element => {
              if (element != "" && element != null)
                this.regionsList.push(dataReg.find(x => x.id == element))
            });
          })
      })

    if (this.isAmc) this.form.get('serviceType').setValidators([Validators.required])

    this.countryService.getAll().pipe(first())
      .subscribe((coun: any) => {
        this.countryList = coun.object

        this.customerService.getAllByConId(this.user.contactId).pipe(first())
          .subscribe((data: any) => {
            this.customerList = data.object
            if (this.IsCust) {
              let cust = this.customerList[0]

              this.form.get('region').setValue(cust.defdistregionid)
              this.form.get('region').disable()

              this.form.get('country').setValue(cust.countryid)
              this.form.get('country').disable()

              setTimeout(() => {
                this.form.get('customer').setValue(cust.id)
                this.form.get('customer').disable()

                cust.sites.forEach(element => {
                  element.contacts.forEach(con => {
                    if (con.id == this.user.contactId) {
                      this.form.get('site').setValue(element.id)
                      this.form.get('site').disable()
                    }
                  });
                });

              }, 300);
            }
          })
      })

    if (this.user.username == "admin") {
      this.customerService.getAll().pipe(first())
        .subscribe((data: any) => this.customerList = data.object)
    }

    if (this.hasInstrument) {
      this.instrumentService.getAll(this.user.userId).pipe(first())
        .subscribe((data: any) => this.instrumentList = data.object)
    }


  }

  onCustomerChange(customer) {
    if (!customer) return;
    this.siteList = this.customerList.find(x => x.id == customer).sites
    setTimeout(() => this.form.get('site').reset(), 20);
  }

  SiteChange(site) {
    if (!site) return;
    this.siteBInstrumentList = this.instrumentList.filter(x => x.custSiteId == site)
    setTimeout(() => this.form.get('insSerialNo').reset(), 200);
  }

  countryChange(country) {
    if (!country) return;
    this.customerBCountryList = this.customerList.filter(x => x.countryid == country)

    setTimeout(() => {
      this.form.get('customer').reset()
      this.form.get("site").reset()
      this.form.get("insSerialNo").reset()
    }, 10);
  }

  onRegionChange(region) {
    if (this.hasInstrument) {
      this.form.get('insSerialNo').setValidators([Validators.required])
      this.form.get('insSerialNo').updateValueAndValidity()
    }

    if (this.hasSite) {
      this.form.get('site').setValidators([Validators.required])
      this.form.get('site').updateValueAndValidity()
    }

    if (this.isUserProfile) {
      this.form.get('insSerialNo').updateValueAndValidity()
      this.form.get('insSerialNo').clearValidators();
      this.form.get('site').clearValidators();
      this.form.get('site').updateValueAndValidity()
    }

    var country = this.regionsList.find(x => x.id == region)?.countries
    this.regionCountryList = []

    country.split(',').forEach(x => {
      this.regionCountryList.push(this.countryList.find(element => element.id == x))
    });


    setTimeout(() => {
      this.form.get("country").reset()
    }, 20);
  }

  clear() {
    this.showData.emit(false)
    this.form.reset();
  }

  async onSubmit() {
    if (this.form.invalid) return this.notificationService.showError("Please fill all fields", "Form Invalid")

    this.modal = this.form.value
    let data: any = await this.instrumentService.getFilteredAll(this.modal, this.controller).toPromise();
    var nData = []

    data.object.forEach(x => {
      var co = new Date(x.createdon)?.getTime()
      var sDate = this.form.get("sDate").value?.getTime()
      var eDate = this.form.get("eDate").value?.getTime()
      if (sDate <= co && co <= eDate) {
        nData.push(x)
      }
    });

    if (this.isAmc) nData = nData.filter(x => x.servicetype == this.form.get('serviceType').value)

    this.nData.emit(nData)
    this.showData.emit(true)
  }

}


