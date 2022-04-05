import {Component, OnInit} from '@angular/core';

import {Country, Customer, ProfileReadOnly, ResultMsg, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CountryService,
  CustomerService,
  DistributorService,
  NotificationService,
  ProfileService
} from '../_services';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.html',
})
export class CustomerComponent implements OnInit {
  user: User;
  customerform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  type: string = "C";
  customerId: string;
  countries: Country[];
  defaultdistributors: any[];
  customer: Customer;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  distRegionsList: any;
  //public defaultdistributors: any[] = [{ key: "1", value: "Ashish" }, { key: "2", value: "CEO" }];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.customerform = this.formBuilder.group({
      custname: ['', Validators.required],
      defdistid: ['', Validators.required],
      defdistregionid: ['', Validators.required],
      isactive: [true],
      isdeleted: [true],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolat: ['', Validators.required],
        geolong: ['', Validators.required],
        isActive: true,
        isdeleted: [false],
      }),
    });

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
        //  this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });

    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.defaultdistributors = data.object;
        },
        error: error => {
         // this.alertService.error(error);
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });

    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.customerService.getById(this.customerId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.customerform.patchValue(data.object);
            this.onDefDistchanged(data.object.defdistid);
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.customerform.controls;
  }

  get a() {
    return this.customerform.controls.address;
  }

  onDefDistchanged(distId) {
    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distRegionsList = data.object.filter(x => x.id === distId)[0].regions;
        },
        error: error => {
          this.notificationService.showSuccess(error, "Error");
          this.loading = false;
        }
      });
  }

  onSubmit() {
    // //debugger;
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.customerform.invalid) {
      return console.log(this.customerform);
    }
    this.isSave = true;
    this.loading = true;
    if (this.customerId == null) {
      this.customerService.save(this.customerform.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["customerlist"]);
            }
            else {
              
            }
            this.loading = false;

          },
          error: error => {
           // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
    else {
      this.customer = this.customerform.value;
      this.customer.id = this.customerId;
      this.customerService.update(this.customerId, this.customer)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["customerlist"]);
            }
            else {
              
            }
            this.loading = false;

          },
          error: error => {
          //  this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
  }
}
