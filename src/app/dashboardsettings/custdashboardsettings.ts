// noinspection DuplicatedCode

import { Component, OnInit } from "@angular/core";
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, AlertService, ListTypeService, NotificationService, ProfileService } from "../_services";
import { first } from "rxjs/operators";
import { CustdashboardsettingsService } from "../_services/custdashboardsettings.service";

@Component({
  selector: 'app-customer',
  templateUrl: './custdashboardsettings.html',
})
export class CustdashboardsettingsComponent implements OnInit {
  form: FormGroup;
  model: any
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User
  Data = []
  localData: any[] = [];

  rowdata1: ListTypeItem[];
  rowdata2: ListTypeItem[];
  rowdata3: ListTypeItem[];
  row1Error: boolean = false;
  row2Error: boolean = false;
  row3Error: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private Service: CustdashboardsettingsService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "DHSET");
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


    this.form = this.formBuilder.group({
      displayIn: "",
      position: 0,
      isDefault: false,
      dashboardFor: "DHCT",
      graphName: "",
      isactive: true,
      isdeleted: [false],

    });

    this.listTypeService
      .getById("CDRW1")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => this.rowdata1 = data
      });

    this.listTypeService.getById("CDRW2")
      .pipe(first()).subscribe({
        next: (data: ListTypeItem[]) => this.rowdata2 = data
      });

    this.listTypeService
      .getById("CDRW3")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.rowdata3 = data;
        },
      });

    this.id = this.user.userId;

    this.hasAddAccess = this.user.username == "admin";

    this.Service.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.Data = data.object;
          this.Data.forEach(value => {
            let valu = document.getElementById(`chk_${value.graphName}`) as HTMLInputElement
            valu.checked = true
            this.localData.push(value)
          })
        }
      });
  }

  toggle(e, formcontroller) {
    let prev = this.localData.filter(row => row.graphName == e && row.displayIn == formcontroller)
    debugger;
    if (prev.length == 0 || prev == null) {
      this.model = this.form.value
      this.model.displayIn = formcontroller
      this.model.position = 0
      this.model.graphName = e
      this.model.dashboardFor = "DHCT"
      this.model.isDefault = false
      this.localData.push(this.model)
      this.model = null
      this.form.reset()
    } else {
      let indexOfElement = this.localData.findIndex((x) => x.graphName == e && x.displayIn == formcontroller)
      if (indexOfElement >= 0) {
        this.localData.splice(indexOfElement, 1);
      }

    }
  }

  resetOptions() {
    if (confirm("Reset all options to default settings?")) {
      this.Service.reset(this.id, "DHCT")
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess("Settings Restored to default", "Success");
              this.router.navigate(['']);

            } else {

            }
            this.loading = false;
          },
          error: error => {

            this.loading = false;
          }
        });
    }
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["/"]);
    }

    else this.router.navigate(["/"]);

  }

  CancelEdit() {
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["/"]);
        })
    }
  }



  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    debugger;
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    // this.isSave = true;
    this.loading = true;


    let row1 = 0
    let row2 = 0
    let row3 = 0

    this.localData.forEach(value => {
      value.isactive = true
      value.isdeleted = false
      switch (value.displayIn) {
        case "row1":
          row1 = row1 + 1
          break;
        case "row2":
          row2 = row2 + 1
          break;
        case "row3":
          row3 = row3 + 1
          break;
      }
    })
    console.log(this.localData)
    if (row1 === 4 && row2 === 3 && row3 === 3) {
      this.Service.update(this.id, this.localData)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(['']);

            } else {

            }
            this.loading = false;

          },
          error: error => {

            this.loading = false;
          }
        });
    } else {
      this.loading = false;
      this.row1Error = row1 != 4
      this.row2Error = row2 != 3
      this.row3Error = row3 != 3
    }
  }
}
