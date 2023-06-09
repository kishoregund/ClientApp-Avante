import { Component, OnInit } from '@angular/core';

import { User, DistributorRegion, Country, Distributor, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, DistributorRegionService, ProfileService, CountryService, DistributorService, NotificationService } from '../_services';


@Component({
  selector: 'app-distributorRegion',
  templateUrl: './distributor-region.html',
})
export class DistributorRegionComponent implements OnInit {
  user: User;
  destributorRegionform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  countries: Country[];
  distributors: Distributor[];
  distRegion: DistributorRegion;
  distributorRegionId: string;
  distributorId: string;
  type: string = "DR";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  isNewSetup: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private countryService: CountryService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private distributorRegionService: DistributorRegionService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
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

    this.destributorRegionform = this.formBuilder.group({
      distid: ['', Validators.required],
      region: ['', Validators.required],
      distregname: ['', Validators.required],
      payterms: ['', Validators.required],
      isblocked: false,
      isActive: true,
      countries: [],
      isdeleted: [false],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolat: ['', Validators.required],
        geolong: ['', Validators.required],
        isActive: false,
      }),
    });

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => this.countries = data.object
      });

    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distributors = data.object;
        },
      });

    this.distributorId = this.route.snapshot.paramMap.get('id');
    this.distributorRegionId = this.route.snapshot.paramMap.get('rid');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });

    this.destributorRegionform.controls['distid'].setValue(this.distributorId, { onlySelf: true });

    if (this.distributorRegionId != null) {
      this.hasAddAccess = false;
      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }
      this.distributorRegionService.getById(this.distributorRegionId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.object;
            this.destributorRegionform.patchValue(this.formData);
            data.object.countries = data.object.countries?.split(',').filter(x => x != "");
            this.destributorRegionform.patchValue({ 'countries': data.object.countries })
          },
        });
      this.destributorRegionform.disable();
    }
    else this.isNewMode = true;
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.destributorRegionform.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["distregionlist", this.distributorId]);
    }

    else this.router.navigate(["distregionlist", this.distributorId]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.distributorRegionId != null) this.destributorRegionform.patchValue(this.formData);
    else this.destributorRegionform.reset();
    this.destributorRegionform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.distributorRegionService.delete(this.distributorRegionId).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["distregionlist", this.distributorId]);
        })
    }
  }



  // convenience getter for easy access to form fields
  get f() {
    return this.destributorRegionform.controls;
  }

  get a() {
    var controls: any = (this.destributorRegionform.controls.address);
    return controls.controls;
  }

  onSubmit() {
    //debugger;
    this.destributorRegionform.markAllAsTouched()
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.destributorRegionform.invalid) {
      return;
    }

    this.distRegion = this.destributorRegionform.value;
    if (this.distRegion.countries.length > 0)
      this.distRegion.countries = this.distRegion.countries.toString();
    else if (this.distRegion.countries.length == 0)
      this.distRegion.countries = "";

    this.isSave = true;
    this.loading = true;
    if (this.distributorRegionId == null) {
      this.distributorRegionService.save(this.distRegion)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result && !this.isNewSetup) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["distregionlist", this.distributorId]);
            }
            else if (data.result && this.isNewSetup) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(['profile'], { queryParams: { isNewSetUp: true } });
            }
          }
        });
    }
    else {
      this.distRegion.id = this.distributorRegionId;
      this.distributorRegionService.update(this.distributorRegionId, this.distRegion)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["distregionlist", this.distributorId]);
            }
            this.loading = false;
          },
        });
    }
  }

}
